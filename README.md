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
- `src/stores` — estado persistente por sucursal (catálogo, inventario, compras, gastos, ventas, caja), usuarios, sesión, empresas y fichas de sucursal
- `src/components/expenses`, `src/components/cash`, `src/components/reports` — piezas visuales de las pantallas financieras
- `src/components/users`, `src/views/LoginView.vue`, `src/views/UsersView.vue` — acceso y administración de cuentas
- `src/components/companies`, `src/components/branches` — directorio de empresas y fichas de sucursal
- `src/components/mybranch`, `src/views/MyBranchView.vue` — ficha de solo lectura de la sucursal asignada y accesos a la operación

## Comandos

```sh
npm install
npm run dev      # servidor de desarrollo
npm run build    # type-check + build de producción
npm run preview  # servir el build
```

La moneda y el idioma se configuran en `src/config/platform.ts`.

## Datos

El estado se guarda en `localStorage` con claves por sucursal (`:centro` / `:norte`). «Todas las sucursales» es una vista agregada de solo lectura. Todos los importes se guardan en USD y se convierten al mostrarlos o capturarlos (USD, COP y CRC). Las cuentas y la sesión activa viven en `estante.users.v1` y `estante.session.v1`; las empresas en `estante.companies.v1` y las fichas de sucursal en `estante.branchProfiles.v1`.

- **Gastos**: alta, edición, pago y baja, con folio `G-xxxx` y categorías.
- **Caja**: sesiones con fondo inicial, arqueo y descuadre; los cobros y gastos pagados en efectivo se asocian por hora.
- **Reportes**: filtro de periodo, ventas, gastos, utilidad, desgloses y exportación CSV.

## Empresas y sucursales

- **Empresas**: directorio de razones sociales con datos fiscales y de contacto, búsqueda y filtros. Solo una puede estar activa: aparece en la cabecera de toda la app. Cambiar de empresa no separa los datos: la información sigue dividida únicamente por sucursal. No se puede desactivar ni eliminar la empresa activa sin marcar otra primero, y siempre debe quedar una activa.
- **Sucursales**: fichas editables de Centro y Norte (domicilio, responsable, horario, contacto, estado y nota), con sus prefijos de folio como referencia. Los identificadores `centro` y `norte` son fijos porque de ellos dependen los datos guardados, los folios y los permisos; por eso no se pueden crear ni borrar sucursales desde la pantalla. El estado es informativo.

Ambas pantallas son de acceso exclusivo para superusuarios.

## Usuarios y permisos

El acceso se simula en el navegador con una pantalla de login. Hay dos perfiles:

- **Superusuario**: ve «Todas las sucursales», puede cambiar a Centro o Norte para operar y es el único que ve **Empresas**, **Sucursales** y **Usuarios**. Puede crear cuentas, editar permisos, activar/desactivar y eliminar usuarios. No se puede eliminar ni desactivar la propia cuenta, ni dejar al último superusuario activo fuera del sistema.
- **Usuario sucursal**: ve solo las sucursales asignadas (una o varias). El selector de sucursal muestra únicamente esas opciones: con una sola sucursal aparece como etiqueta fija, sin control de cambio; con dos permite cambiar entre ellas y muestra también el agregado «Todas», siempre de solo lectura. El dashboard saluda con su nombre y la vista **Mi sucursal** muestra la ficha de sus sucursales (solo lectura) con accesos directos a Vender, Caja, Inventario y Reportes. No puede administrar usuarios, empresas ni sucursales, y esas tres rutas muestran «Sin permiso».

### Cuentas de demostración

| Correo | Contraseña | Perfil | Alcance |
| --- | --- | --- | --- |
| `admin@estante.local` | `admin123` | Superusuario | Todas las sucursales |
| `centro@estante.local` | `centro123` | Sucursal | Centro |
| `norte@estante.local` | `norte123` | Sucursal | Norte |
| `sucursales@estante.local` | `sucursales123` | Sucursal | Centro y Norte |

> **Aviso:** es una demo local. Las contraseñas se guardan en `localStorage` sin cifrar y no protegen información real. No reutilices contraseñas propias; para un entorno de producción hace falta autenticación en servidor, contraseñas hasheadas y control de acceso desde el backend.

Para reiniciar los datos de ejemplo y cerrar la sesión, borra las claves `estante.*` de `localStorage` y recarga la página.

## Publicación

La versión pública está en **https://darwinvelasco-03.github.io/Estante-Ventas/**. El flujo `.github/workflows/deploy.yml` compila con `npm ci` + `npm run build` y publica `dist` en GitHub Pages en cada push a `master` (o manualmente desde *Actions → Deploy a GitHub Pages → Run workflow*). El build usa rutas relativas (`base: './'`) para funcionar bajo el subdirectorio del proyecto.

La aplicación es estática y sigue siendo una demo: el estado vive en el `localStorage` de cada navegador, así que los datos no se sincronizan entre dispositivos y el servicio no necesita que la máquina de desarrollo esté encendida.
