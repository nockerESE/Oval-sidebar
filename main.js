const { app, BrowserWindow, screen, Tray, Menu, globalShortcut, nativeImage, ipcMain } = require('electron')

let win
let tray
let isVisible = true

function createTray() {
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAA30lEQVRYhe2WQQ6CMBBFHxcewCMoN9EDIBN3XkUPQOIBTGMsxAWJkZ3xAHoD72BTQqAtzRQX/k0zm+m8TGdaCCGEqAtwBe7AyLP2wAU4AiNgDayAM3AzSX0JyAIsLMo3MAvQ2AXI2DwLkAKFR/CsANfMWTwDlkAawK2kA1bAzSR1JQDIkCig8CiBPMoHDpR+TXkPjDOmQLkPjDWmgIlBhhTQG+SkAIb0qDeAVoBWgFaAVoBWgFb+UwAv4OoBdgP2Z+Bu2R6Af+kDVgPuCZHdgH2QsAAAAABJRU5ErkJggg==')

  tray = new Tray(icon)
  tray.setToolTip('Oval — Ctrl+Shift+S')

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Tampilkan / Sembunyikan', click: toggleWindow },
    { type: 'separator' },
    { label: 'Keluar Oval', click: () => { app.isQuitting = true; app.quit() } }
  ])

  tray.setContextMenu(contextMenu)
  tray.on('click', toggleWindow)
}

function toggleWindow() {
  if (!win || win.isDestroyed()) return

  if (isVisible) {
    win.hide()
    isVisible = false
  } else {
    win.show()
    win.focus()
    isVisible = true
  }
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  win = new BrowserWindow({
    width: 380,
    height: height,
    x: width - 380,
    y: 0,
    resizable: true,
    alwaysOnTop: true,
    frame: false,
    skipTaskbar: true,
    title: 'Oval',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    }
  })

  win.loadFile('index.html')

  win.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault()
      win.hide()
      isVisible = false
    }
  })

  win.on('resize', () => {
    const [w] = win.getSize()
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
    win.setPosition(sw - w, 0)
    win.setSize(w, sh)
  })

  createTray()

  globalShortcut.register('CommandOrControl+Shift+Space', toggleWindow)

  ipcMain.on('quit-app', () => {
    app.isQuitting = true
    app.quit()
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', (e) => {
  e.preventDefault()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
