import type { Product } from '@/types/pos'

/** Catálogo de ejemplo para el mostrador. Precio de etiqueta con IVA incluido. */
export const products: Product[] = [
  { id: 'p01', barcode: '7501000123456', sku: 'HAR-001', name: 'Harina de trigo 1 kg', price: 28, stock: 24, unit: 'und', category: 'Abarrotes' },
  { id: 'p02', barcode: '7501000223457', sku: 'ACE-014', name: 'Aceite vegetal 1 L', price: 46, stock: 11, unit: 'und', category: 'Abarrotes' },
  { id: 'p03', barcode: '7501000323458', sku: 'AZU-006', name: 'Azúcar refinada 1 kg', price: 32, stock: 15, unit: 'und', category: 'Abarrotes' },
  { id: 'p04', barcode: '7501000423459', sku: 'FRI-003', name: 'Frijol negro 1 kg', price: 55, stock: 18, unit: 'und', category: 'Abarrotes' },
  { id: 'p05', barcode: '7501000523460', sku: 'ARR-002', name: 'Arroz blanco 1 kg', price: 38, stock: 30, unit: 'und', category: 'Abarrotes' },
  { id: 'p06', barcode: '7501000623461', sku: 'LEC-011', name: 'Leche entera 1 L', price: 27, stock: 9, unit: 'und', category: 'Lácteos' },
  { id: 'p07', barcode: '7501000723462', sku: 'CAF-009', name: 'Café molido 500 g', price: 92, stock: 8, unit: 'und', category: 'Abarrotes' },
  { id: 'p08', barcode: '7501000823463', sku: 'HUE-005', name: 'Huevo, docena', price: 68, stock: 6, unit: 'doc', category: 'Frescos' },
  { id: 'p09', barcode: '7501000923464', sku: 'PAN-020', name: 'Pan de caja 500 g', price: 35, stock: 14, unit: 'und', category: 'Panadería' },
  { id: 'p10', barcode: '7501001023465', sku: 'MAN-008', name: 'Mantequilla 200 g', price: 49, stock: 5, unit: 'und', category: 'Lácteos' },
  { id: 'p11', barcode: '7501001123466', sku: 'QUE-004', name: 'Queso fresco 500 g', price: 78, stock: 7, unit: 'und', category: 'Lácteos' },
  { id: 'p12', barcode: '7501001223467', sku: 'TOM-015', name: 'Tomate, por kg', price: 24, stock: 20, unit: 'kg', category: 'Frescos' },
  { id: 'p13', barcode: '7501001323468', sku: 'CEB-016', name: 'Cebolla, por kg', price: 19, stock: 22, unit: 'kg', category: 'Frescos' },
  { id: 'p14', barcode: '7501001423469', sku: 'PAPA-030', name: 'Papaya, pieza', price: 45, stock: 4, unit: 'und', category: 'Frescos' },
  { id: 'p15', barcode: '7501001523470', sku: 'AGU-023', name: 'Agua natural 1 L', price: 14, stock: 40, unit: 'und', category: 'Bebidas' },
  { id: 'p16', barcode: '7501001623471', sku: 'REF-024', name: 'Refresco 1.5 L', price: 32, stock: 16, unit: 'und', category: 'Bebidas' },
  { id: 'p17', barcode: '7501001723472', sku: 'GAL-018', name: 'Galletas de sal, paquete', price: 26, stock: 12, unit: 'und', category: 'Botanas' },
  { id: 'p18', barcode: '7501001823473', sku: 'DET-025', name: 'Detergente líquido 1 L', price: 58, stock: 3, unit: 'und', category: 'Limpieza' },
  { id: 'p19', barcode: '7501001923474', sku: 'PAH-026', name: 'Papel higiénico, 4 rollos', price: 62, stock: 10, unit: 'paq', category: 'Limpieza' },
  { id: 'p20', barcode: '7501002023475', sku: 'SAL-007', name: 'Sal refinada 1 kg', price: 16, stock: 25, unit: 'und', category: 'Abarrotes' },
]
