import { branchOptions, type BranchId, type BranchKey } from '@/config/branches'
import type { DashboardSnapshot } from '@/types/dashboard'

const money = (value: number) => value

const label = (id: BranchId) =>
  branchOptions.find((option) => option.id === id)?.label ?? 'Sucursal Centro'

const centroSnapshot: DashboardSnapshot = {
  branch: label('centro'),
  dateLabel: 'Jueves 19 de noviembre',
  salesToday: money(12480),
  salesGoal: money(16000),
  salesDelta: 8.4,
  transactions: 42,
  averageTicket: money(297),
  cashOnHand: money(3210),
  stockHealth: 87,
  trend: [32, 41, 38, 52, 47, 61, 58, 74, 69, 83, 78, 92],
  movements: [
    {
      id: 'm1',
      kind: 'venta',
      folio: 'V-2041',
      title: 'Venta en mostrador',
      detail: 'Caja 02 · 6 artículos',
      amount: money(1240),
      time: '13:42',
    },
    {
      id: 'm2',
      kind: 'compra',
      folio: 'C-0887',
      title: 'Compra a Distribuidora Luna',
      detail: 'Proveedor · 18 bultos',
      amount: money(860),
      time: '12:15',
      pending: true,
    },
    {
      id: 'm3',
      kind: 'gasto',
      folio: 'G-0112',
      title: 'Luz y agua',
      detail: 'Servicios del local',
      amount: money(310),
      time: '10:03',
    },
    {
      id: 'm4',
      kind: 'caja',
      folio: 'A-0034',
      title: 'Apertura de caja',
      detail: 'Caja 01 · turno mañana',
      amount: money(800),
      time: '08:05',
    },
  ],
  lowStock: [
    { sku: 'HAR-001', name: 'Harina de trigo 1 kg', remaining: 4, unit: 'und', threshold: 12 },
    { sku: 'ACE-014', name: 'Aceite vegetal 1 L', remaining: 2, unit: 'und', threshold: 10 },
    { sku: 'AZU-006', name: 'Azúcar refinada 1 kg', remaining: 6, unit: 'und', threshold: 15 },
  ],
}

const norteSnapshot: DashboardSnapshot = {
  branch: label('norte'),
  dateLabel: 'Jueves 19 de noviembre',
  salesToday: money(7380),
  salesGoal: money(9500),
  salesDelta: 4.1,
  transactions: 26,
  averageTicket: money(284),
  cashOnHand: money(1980),
  stockHealth: 79,
  trend: [18, 24, 21, 33, 29, 38, 35, 49, 44, 55, 51, 63],
  movements: [
    {
      id: 'm1-n',
      kind: 'venta',
      folio: 'V-3042',
      title: 'Venta en mostrador',
      detail: 'Caja 01 · 4 artículos',
      amount: money(760),
      time: '14:05',
    },
    {
      id: 'm2-n',
      kind: 'compra',
      folio: 'C-0912',
      title: 'Compra a Molinos Norte',
      detail: 'Proveedor · 12 bultos',
      amount: money(540),
      time: '11:48',
      pending: true,
    },
    {
      id: 'm3-n',
      kind: 'gasto',
      folio: 'G-0208',
      title: 'Luz y agua',
      detail: 'Servicios del local',
      amount: money(245),
      time: '09:20',
    },
    {
      id: 'm4-n',
      kind: 'caja',
      folio: 'A-0041',
      title: 'Apertura de caja',
      detail: 'Caja 01 · turno mañana',
      amount: money(600),
      time: '07:55',
    },
  ],
  lowStock: [
    { sku: 'LEC-011-N', name: 'Leche entera 1 L', remaining: 3, unit: 'und', threshold: 12 },
    { sku: 'PAN-020-N', name: 'Pan de caja 500 g', remaining: 1, unit: 'und', threshold: 10 },
  ],
}

export const dashboardSnapshot = centroSnapshot

function emptyCentro(): DashboardSnapshot {
  return {
    ...centroSnapshot,
    salesToday: 0,
    salesGoal: 0,
    salesDelta: 0,
    transactions: 0,
    averageTicket: 0,
    cashOnHand: 0,
    stockHealth: 0,
    trend: [],
    movements: [],
    lowStock: [],
  }
}

function emptyNorte(): DashboardSnapshot {
  return { ...emptyCentro(), branch: label('norte'), dateLabel: norteSnapshot.dateLabel }
}

/** «Todas las sucursales» suma importes y movimientos; nunca es editable. */
function aggregate(a: DashboardSnapshot, b: DashboardSnapshot): DashboardSnapshot {
  const transactions = a.transactions + b.transactions
  return {
    ...a,
    branch: label('all'),
    salesToday: a.salesToday + b.salesToday,
    salesGoal: a.salesGoal + b.salesGoal,
    salesDelta: (a.salesDelta + b.salesDelta) / 2,
    transactions,
    averageTicket: transactions
      ? (a.averageTicket * a.transactions + b.averageTicket * b.transactions) / transactions
      : 0,
    cashOnHand: a.cashOnHand + b.cashOnHand,
    stockHealth: (a.stockHealth + b.stockHealth) / 2,
    trend: a.trend.map((value, index) => value + (b.trend[index] ?? 0)),
    movements: [...a.movements, ...b.movements].sort((x, y) => y.time.localeCompare(x.time)),
    lowStock: [...a.lowStock, ...b.lowStock],
  }
}

export function snapshotFor(id: BranchId): DashboardSnapshot {
  if (id === 'all') return aggregate(centroSnapshot, norteSnapshot)
  return id === 'norte' ? norteSnapshot : centroSnapshot
}

export function emptyFor(id: BranchId): DashboardSnapshot {
  if (id === 'all') return aggregate(emptyCentro(), emptyNorte())
  return id === 'norte' ? emptyNorte() : emptyCentro()
}

export const emptySnapshot = emptyFor('centro')

export function isBranchKey(id: BranchId): id is BranchKey {
  return id !== 'all'
}
