const { resolve, basename } = require('path')
const { app, Tray, Menu, dialog } = require('electron')

const Store = require('electron-store')
const { spawn } = require('child_process')

const schema = {
  projects: {
    type: 'string'
  }
}

const store = new Store({ schema })

process.platform === 'darwin' && app.dock.hide()

app.on('ready', () => {
  const storedProjects = store.get('projects')
  const projects = storedProjects
    ? JSON.parse(store.get('projects'))
    : []

  const items = projects.map((project) => {
    return {
      label: project.name,
      click: () => spawn('code', [project.path], { shell: true })
    }
  })

  const tray = process.platform === 'darwin'
    ? new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'))
    : process.platform === 'linux'
      ? new Tray(resolve(__dirname, 'assets', 'vscode-white.png'))
      : new Tray(resolve(__dirname, 'assets', 'vscode-white.ico'))

  const contextMenu = Menu.buildFromTemplate([
    ...items,
    {
      label: 'Adicionar novo projeto...',
      type: 'radio',
      checked: true,
      click: () => {
        dialog.showOpenDialog({ properties: ['openDirectory'] })
          .then((path) => {
            const projectPath = path.filePaths[0]
            store.set('projects', JSON.stringify([...projects, {
              path: projectPath,
              name: basename(projectPath)
            }]))
          }).catch((err) => console.log(err)).finally(() => console.log('Projeto Adicionado'))
      }
    }
  ])

  tray.setContextMenu(contextMenu)
})
