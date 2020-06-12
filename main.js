const { resolve } = require('path')
const { app, Tray, Menu, dialog } = require('electron')

process.platform === 'darwin' && app.dock.hide()

app.on('ready', () => {
  const tray = process.platform === 'darwin'
    ? new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'))
    : process.platform === 'linux'
      ? new Tray(resolve(__dirname, 'assets', 'vscode-white.png'))
      : new Tray(resolve(__dirname, 'assets', 'vscode-white.ico'))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Item1',
      type: 'radio',
      checked: true,
      click: () => {
        dialog.showOpenDialog({ properties: ['openDirectory'] })
          .then((path) => console.log(path.filePaths))
      },
    }
  ])
  
  tray.setContextMenu(contextMenu)
})
