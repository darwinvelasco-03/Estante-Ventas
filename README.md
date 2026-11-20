# Estante

Plataforma web de gestión comercial para abarroteras y distribuidoras: dashboard operativo, inventario, punto de venta, clientes, proveedores, compras, gastos, caja y reportes.

## Stack

- Vue 3 + TypeScript
- Vite
- Tailwind CSS v4
- Fuentes autoalojadas: Archivo Variable e IBM Plex Sans

## Diseño

La identidad visual se construye sobre una paleta botella/papel/mostaza y una estructura "tarima y estante": grupos horizontales con rieles finos, cifras tabulares y color reservado a estados. Las decisiones visuales siguen la skill `frontend-design`.

## Estructura

- `src/components/layout` — cascarón, navegación lateral, cabecera y búsqueda global
- `src/components/dashboard` — panel de pulso, métricas, tendencia, movimientos, alertas y acciones
- `src/components/ui` — componentes presentacionales reutilizables
- `src/views` — composición de pantallas
- `src/composables` — obtención de datos, separada de la vista
- `src/config` — navegación, marca, moneda e idioma
- `src/stores` — estado persistente por sucursal (catálogo, inventario, compras, gastos, ventas, caja)
- `src/components/expenses`, `src/components/cash`, `src/components/reports` — piezas visuales de las pantallas financieras

## Comandos

```sh
npm install
npm run dev      # servidor de desarrollo
npm run build    # type-check + build de producción
npm run preview  # servir el build
```

La moneda y el idioma se configuran en `src/config/platform.ts`.

## Datos

El estado se guarda en `localStorage` con claves por sucursal (`:centro` / `:norte`). «Todas las sucursales» es una vista agregada de solo lectura. Todos los importes se guardan en USD y se convierten al mostrarlos o capturarlos (USD, COP y CRC).

- **Gastos**: alta, edición, pago y baja, con folio `G-xxxx` y categorías.
- **Caja**: sesiones con fondo inicial, arqueo y descuadre; los cobros y gastos pagados en efectivo se asocian por hora.
- **Reportes**: filtro de periodo, ventas, gastos, utilidad, desgloses y exportación CSV.

Para reiniciar los datos de ejemplo, borra las claves `estante.*` de `localStorage` y recarga la página.
