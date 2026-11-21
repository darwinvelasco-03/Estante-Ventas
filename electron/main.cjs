const { app, BrowserWindow, protocol, shell } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const distPath = path.join(__dirname, '..', 'dist')
const iconPath = path.join(__dirname, '..', 'build', 'icon.ico')

// Los módulos ES del build de Vite no cargan desde file://, así que se sirve
// el directorio dist mediante un protocolo propio y seguro.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, supportFetchAPI: true, bypassCSP: true },
  },
])

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 640,
    title: 'Estante',
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  win.loadURL('app://localhost/index.html')

  // Los enlaces web se abren en el navegador del sistema, nunca dentro de la app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const requested = decodeURIComponent(new URL(request.url).pathname)
    const resolved = path.normalize(path.join(distPath, requested === '/' ? 'index.html' : requested))
    if (resolved !== distPath && !resolved.startsWith(distPath + path.sep)) {
      return new Response('Forbidden', { status: 403 })
    }
    // El router es por hash; cualquier ruta sin extensión devuelve index.html.
    const file = path.extname(resolved) ? resolved : path.join(distPath, 'index.html')
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return new Response('Not found', { status: 404 })
    }
    return new Response(fs.readFileSync(file), {
      headers: { 'Content-Type': MIME[path.extname(file).toLowerCase()] ?? 'application/octet-stream' },
    })
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
