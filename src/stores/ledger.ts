import { computed } from 'vue'

import type { BranchKey } from '@/config/branches'
import { branchId, isAllBranches, writableBranch } from '@/stores/branch'
import { activeSessionFor } from '@/stores/cash'
import { voidExpensePayment, expensesFor } from '@/stores/expenses'
import { movementsFor, registerMovement, voidMovement } from '@/stores/inventory'
import { orderedTotal, purchasesFor, voidPurchasePayment } from '@/stores/purchases'
import { recordAdjustment } from '@/stores/reversals'
import { salesFor, voidSale } from '@/stores/sales'
import { currentUser } from '@/stores/users'
import type { LedgerEntry, ReversalStamp } from '@/types/reversal'

function saleEntries(key: BranchKey): LedgerEntry[] {
  return salesFor(key).map((sale) => ({
    id: `venta:${sale.id}`,
    kind: 'venta',
    sourceId: sale.id,
    branch: key,
    folio: sale.folio,
    date: sale.createdAt,
    title: 'Venta',
    detail: `${sale.itemCount} artículos · ${sale.lines.length} renglones`,
    amount: sale.total,
    paymentMethod: sale.paymentMethod,
    reversal: sale.reversal ?? null,
  }))
}

function movementEntries(key: BranchKey): LedgerEntry[] {
  return movementsFor(key).map((movement) => ({
    id: `inventario:${movement.id}`,
    kind: 'inventario',
    sourceId: movement.id,
    branch: key,
    folio: movement.note?.match(/Folio\s+([^\s]+)/)?.[1] ?? movement.id,
    date: movement.createdAt,
    title: movement.productName,
    detail: `${movement.reason}${movement.note ? ` · ${movement.note}` : ''}`,
    amount: null,
    reversal: movement.reversal ?? null,
  }))
}

function purchaseEntries(key: BranchKey): LedgerEntry[] {
  return purchasesFor(key)
    .filter((purchase) => !!purchase.paidAt)
    .map((purchase) => ({
      id: `compra:${purchase.id}`,
      kind: 'compra',
      sourceId: purchase.id,
      branch: key,
      folio: purchase.folio,
      date: purchase.paidAt ?? purchase.createdAt,
      title: purchase.supplierName || 'Orden de compra',
      detail: `${purchase.lines.length} renglones · ${purchase.receivedAt ? 'Recibida' : 'Pendiente de recibir'}`,
      amount: orderedTotal(purchase),
      currency: purchase.currency,
      paymentMethod: purchase.paymentMethod,
      reversal: purchase.reversal ?? null,
    }))
}

function expenseEntries(key: BranchKey): LedgerEntry[] {
  return expensesFor(key)
    .filter((expense) => expense.status === 'pagado')
    .map((expense) => ({
      id: `gasto:${expense.id}`,
      kind: 'gasto',
      sourceId: expense.id,
      branch: key,
      folio: expense.folio,
      date: expense.paidAt ?? expense.date,
      title: expense.concept,
      detail: `${expense.category}${expense.supplierName ? ` · ${expense.supplierName}` : ''}`,
      amount: expense.amount,
      currency: expense.currency,
      paymentMethod: expense.paymentMethod,
      reversal: expense.reversal ?? null,
    }))
}

/** Bitácora unificada de documentos contabilizados, de la más reciente a la más antigua. */
export const ledger = computed(() => {
  const keys: BranchKey[] = isAllBranches.value
    ? ['centro', 'norte']
    : [branchId.value as BranchKey]
  const entries = keys.flatMap((key) => [
    ...saleEntries(key),
    ...movementEntries(key),
    ...purchaseEntries(key),
    ...expenseEntries(key),
  ])
  return entries.sort((a, b) => b.date.localeCompare(a.date))
})

export interface RevertResult {
  ok: boolean
  message: string
}

/**
 * Anula cualquier documento de la bitácora. El original conserva su historia;
 * se genera un contra-movimiento de stock cuando aplica y un ajuste negativo
 * que descuenta el importe en la fecha de la anulación.
 */
export function revertLedgerEntry(
  entry: LedgerEntry,
  reason: string,
  by = currentUser.value?.name ?? 'Usuario',
): RevertResult {
  const key = writableBranch()
  if (!key || entry.branch !== key) {
    return { ok: false, message: 'Selecciona una sucursal concreta para anular movimientos.' }
  }
  if (entry.reversal) {
    return { ok: false, message: 'Este movimiento ya está anulado.' }
  }

  const stamp: ReversalStamp = {
    reversedAt: new Date().toISOString(),
    reason: reason.trim() || 'Corrección de registro',
    by,
  }
  const session = activeSessionFor(key)
  const baseAdjustment = {
    sourceId: entry.sourceId,
    folio: entry.folio,
    branch: key,
    createdAt: stamp.reversedAt,
    sessionId: session?.id ?? null,
    reason: stamp.reason,
  }

  switch (entry.kind) {
    case 'venta': {
      const sale = voidSale(entry.sourceId, stamp)
      if (!sale) return { ok: false, message: 'No pudimos anular esa venta.' }
      for (const line of sale.lines) {
        registerMovement({
          productId: line.productId,
          type: 'entrada',
          quantity: line.quantity,
          reason: 'Reversión',
          note: `Anulación ${sale.folio}`,
        })
      }
      recordAdjustment(key, {
        ...baseAdjustment,
        category: 'venta',
        amount: sale.total,
        paymentMethod: sale.paymentMethod,
      })
      return {
        ok: true,
        message: `Venta ${sale.folio} anulada: stock repuesto y ajuste registrado.`,
      }
    }
    case 'inventario': {
      const exists = movementsFor(key).some(
        (movement) => movement.id === entry.sourceId && !movement.reversal,
      )
      if (!exists) return { ok: false, message: 'Ese movimiento ya no está activo.' }
      const counter = voidMovement(entry.sourceId, stamp)
      return {
        ok: true,
        message: counter
          ? 'Movimiento anulado y contra-movimiento registrado en Inventario.'
          : 'Movimiento anulado. No hubo contra-movimiento por falta de stock.',
      }
    }
    case 'gasto': {
      const expense = voidExpensePayment(entry.sourceId, stamp)
      if (!expense) return { ok: false, message: 'No pudimos anular el pago de ese gasto.' }
      recordAdjustment(key, {
        ...baseAdjustment,
        category: 'gasto',
        amount: expense.amount,
        paymentMethod: expense.paymentMethod,
        expenseCategory: expense.category,
      })
      return { ok: true, message: `Gasto ${expense.folio} anulado y ajustado.` }
    }
    case 'compra': {
      const purchase = voidPurchasePayment(entry.sourceId, stamp)
      if (!purchase) return { ok: false, message: 'No pudimos anular el pago de esa orden.' }
      recordAdjustment(key, {
        ...baseAdjustment,
        category: 'compra',
        amount: orderedTotal(purchase),
        paymentMethod: purchase.paymentMethod,
        supplierName: purchase.supplierName,
      })
      return { ok: true, message: `Orden ${purchase.folio} anulada y ajustada.` }
    }
  }
}
