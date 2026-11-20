/** Entidad jurídica de la organización. La empresa activa se muestra en la cabecera. */
export interface Company {
  id: string
  legalName: string
  tradeName: string
  /** Identificación fiscal (RFC, NIT o equivalente). */
  taxId: string
  phone: string
  email: string
  street: string
  city: string
  active: boolean
  createdAt: string
}

export type CompanyInput = Pick<
  Company,
  'legalName' | 'tradeName' | 'taxId' | 'phone' | 'email' | 'street' | 'city' | 'active'
>

export type CompanyError =
  | 'legalName'
  | 'taxId'
  | 'correo'
  | 'duplicado'
  | 'no-encontrado'
  | 'activa'
  | 'ultima-activa'
