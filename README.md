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

El estado se guarda en `localStorage` con claves por sucursal (`:centro` / `:norte`). «Todas las sucursales» es una vista agregada de solo lectura. Todos los importes se guardan en USD y se convierten al mostrarlos o capturarlos (USD, COP y CRC). Las cuentas y la sesión activa viven en `estante.users.v1` y `estante.session.v1`; las empresas en `estante.companies.v1` y las fichas de sucursal en `estante.branchProfiles.v1`; los ajustes de anulación en `estante.reversals.v1:centro` / `:norte`.

- **Compras**: órdenes con folio `OC-xxxx`, recepción parcial en Inventario, forma de pago (efectivo o tarjeta) y fecha de pago. Una orden se puede pagar al crearla o después con **Marcar como pagada**; las órdenes pagadas se contabilizan como egreso por el total pedido. Las órdenes antiguas sin fecha de pago se consideran no pagadas hasta que se marquen. Una orden anulada conserva su pago original y se compensa con un ajuste (ver **Movimientos**).
- **Gastos**: alta, edición, pago y baja, con folio `G-xxxx` y categorías. Un gasto anulado conserva su estado pagado y se compensa con un ajuste (ver **Movimientos**).
- **Caja**: sesiones con fondo inicial, arqueo y descuadre; los cobros, gastos y compras pagados en efectivo se asocian por hora. El efectivo esperado es `fondo + ventas en efectivo − gastos en efectivo − compras en efectivo`. Las anulaciones descuentan su importe en el turno abierto y aparecen como **Ajustes por anulación**.
- **Reportes**: filtro de periodo, ventas, gastos, compras pagadas, utilidad, desgloses (incluido compras por proveedor) y exportación CSV. Solo cuentan los gastos y las órdenes marcados como pagados; la utilidad resta ambos egresos de los cobros. Las anulaciones descuentan el importe en la fecha en que ocurrieron y el CSV incluye renglones negativos (ver **Movimientos**).

## Movimientos y anulaciones

**Movimientos** (grupo **Finanzas**, icono de historial) reúne en una bitácora los cobros del Punto de venta, los movimientos de Inventario, las órdenes de compra pagadas y los gastos pagados. Permite buscar por folio, documento o detalle, filtrar por **Activos / Anulados** y por tipo, y consultar el detalle de cada registro. En «Todas las sucursales» se concatenan ambas tiendas y la vista es de solo lectura: el botón **Anular** no aparece.

Cualquier usuario con escritura en la sucursal puede anular. La acción pide un motivo y sigue estas reglas:

- **Nada se borra.** El documento original conserva su folio, fecha, estado pagado/cobrado e historial. Solo recibe una huella de anulación con fecha, motivo y autor, y se muestra como **Anulado / ANULADA** en su vista y en la bitácora.
- **Venta:** se repone el stock con entradas de Inventario (`Reversión · Anulación <folio>`) y se registra un ajuste negativo por el total cobrado.
- **Movimiento de inventario:** se crea un contra-movimiento invertido. Si no hay existencias para deshacer una entrada, el ajuste llega hasta el saldo disponible y la nota lo indica.
- **Compra o gasto pagado:** se anula el pago sin quitar `paidAt` ni cambiar `status`. El documento sigue en su periodo original y no se puede volver a pagar, editar ni eliminar (devuelve el error `anulado`).
- **Compensación fechada hoy:** el ajuste negativo se contabiliza en la sesión de Caja abierta de esa sucursal y en Reportes con la fecha de la anulación. Así no se reescriben cierres ni reportes ya emitidos. Caja lo muestra como **Ajustes por anulación**; Reportes lo descuenta de totales, días, métodos de pago, categorías y proveedores.
- El CSV de Reportes incluye una fila por ajuste (`Anulación de venta/gasto/compra`) con importe negativo, además de la fila original.

Las anulaciones de una sucursal no afectan a la otra. Para probar estados de carga y error: `?movimientos=cargando#/movimientos` y `?movimientos=error#/movimientos`.

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

## Ambientes, ramas y publicación

| Rama | Ambiente | URL | Workflow |
| --- | --- | --- | --- |
| `desarrollo` | Pruebas / desarrollo | https://darwinvelasco-03.github.io/Estante-Ventas/dev/ | `.github/workflows/deploy-dev.yml` |
| `master` | Producción | https://darwinvelasco-03.github.io/Estante-Ventas/ | `.github/workflows/deploy.yml` |

Ambos workflows compilan con `npm ci` + `npm run build` y publican en la rama `gh-pages`: producción en la raíz y desarrollo en `/dev/`, sin borrarse entre sí. El build usa rutas relativas (`base: './'`), así que funciona igual en la raíz que en un subdirectorio. Para publicar basta con hacer push a la rama correspondiente; también puedes forzar un republicado desde *Actions → nombre del workflow → Run workflow*. El workflow de APK sigue disparándose solo con push a `master`.

### Apagar y encender la página

La variable de repositorio `MAINTENANCE` controla la web de producción:

1. En GitHub entra en **Settings → Secrets and variables → Actions → pestaña Variables** y edita `MAINTENANCE`.
2. Ponla en `true` y ejecuta *Actions → Deploy a GitHub Pages (producción) → Run workflow*. La raíz mostrará la pantalla de `maintenance/index.html`. El entorno `/dev/` sigue disponible.
3. Para reactivarla, ponla en `false` y vuelve a ejecutar el mismo workflow. Regresa el build normal.

No se borra nada: el código, los artefactos y el `localStorage` de cada navegador quedan intactos. Si quieres apagar también el acceso a `/dev/`, ejecuta *Run workflow* de desarrollo con la variable en `true` (usa la misma plantilla de mantenimiento).

### Probar sin publicar

```bash
npm run dev                                        # desarrollo en http://localhost:5173
npm run preview -- --host 127.0.0.1 --port 4173    # revisar el build tal como se publica
```

La aplicación es estática y sigue siendo una demo: el estado vive en el `localStorage` de cada navegador, así que los datos no se sincronizan entre dispositivos y el servicio no necesita que la máquina de desarrollo esté encendida.

## Aplicación de escritorio (Windows)

La misma interfaz se empaqueta con **Electron**. El proceso principal (`electron/main.cjs`) sirve `dist` mediante el protocolo `app://` porque los módulos ES no cargan desde `file://`; el router por hash y el código de la app no necesitan cambios.

```bash
npm install
npm run electron:dev     # compila y abre la app electron sin empaquetar
npm run electron:build   # compila y genera los .exe en dist-electron/
```

Artefactos generados en `dist-electron/`:

- **Instalador:** `Estante Setup 0.0.0.exe` (NSIS, instalación por usuario, con accesos directos).
- **Portable:** `Estante-Portable.exe` (sin instalación).

El ícono de la app es `build/icon.ico` (256×256), generado con los colores de la marca. La app funciona sin conexión.

> El `localStorage` de la app de escritorio es **independiente** del navegador y de GitHub Pages: lo que registres en una versión no aparece en las otras. Siguen aplicando los avisos de demo local sobre contraseñas sin cifrar.

## Aplicación Android (APK)

La misma app se empaqueta para celular con **Capacitor 8**. El proyecto nativo está en `android/` y no necesita plugins especiales: la interfaz se ejecuta en un WebView con los archivos del build incluidos, así que funciona sin conexión.

El APK se compila automáticamente en GitHub Actions (`.github/workflows/apk.yml`) en cada push a `master` o manualmente desde *Actions → Compilar APK de Estante → Run workflow*. El workflow instala JDK 21 y el SDK de Android 36, corre `npm run build` + `npx cap sync android` y Gradle, y deja el resultado en dos lugares:

- **Release «Estante para Android»** (tag `apk-latest`): descarga directa del `app-debug.apk`.
- **Artefacto `Estante-APK`** en cada ejecución del workflow.

Para sincronizar cambios locales (requiere Node 22+ y `npx cap add android` ya ejecutado):

```bash
npm run android:sync
```

> El APK es de **depuración**, suficiente para instalarlo directamente habilitando «Instalar aplicaciones desconocidas» en el celular; no está firmado para Google Play. El `localStorage` de la app Android es independiente del navegador, de GitHub Pages y del `.exe`.
