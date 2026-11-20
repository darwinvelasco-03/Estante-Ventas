import type { IconName } from '@/types/icons'

export interface NavItem {
  id: string
  label: string
  icon: IconName
  /** Solo visible para superusuarios. */
  adminOnly?: boolean
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: 'Operación',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'mi-sucursal', label: 'Mi sucursal', icon: 'branches' },
      { id: 'pos', label: 'Punto de venta', icon: 'pos' },
      { id: 'productos', label: 'Productos', icon: 'products' },
      { id: 'inventario', label: 'Inventario', icon: 'inventory' },
    ],
  },
  {
    label: 'Relaciones',
    items: [
      { id: 'clientes', label: 'Clientes', icon: 'clients' },
      { id: 'proveedores', label: 'Proveedores', icon: 'providers' },
    ],
  },
  {
    label: 'Finanzas',
    items: [
      { id: 'compras', label: 'Compras', icon: 'purchases' },
      { id: 'gastos', label: 'Gastos', icon: 'expenses' },
      { id: 'caja', label: 'Caja', icon: 'cash' },
      { id: 'reportes', label: 'Reportes', icon: 'reports' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'empresas', label: 'Empresas', icon: 'companies', adminOnly: true },
      { id: 'sucursales', label: 'Sucursales', icon: 'branches', adminOnly: true },
      { id: 'usuarios', label: 'Usuarios', icon: 'users', adminOnly: true },
      { id: 'configuracion', label: 'Configuración', icon: 'settings' },
    ],
  },
]

export const allNavItems = navGroups.flatMap((group) => group.items)
