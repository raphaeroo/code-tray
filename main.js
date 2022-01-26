const { resolve, basename } = require('path')
const { app, Menu, Tray, dialog } = require('electron')

const { spawn } = require('child_process')
const fixPath = require('fix-path')
const { readFileSync } = require('fs')

const Store = require('electron-store')
const { init } = require('@sentry/electron')

fixPath()

init({
  dsn: 'https://19b49f03c3614155916af54680f728b5@o559602.ingest.sentry.io/5694558'
})

const schema = {
  projects: {
    type: 'string'
  }
}

let mainTray = {}

if (app.dock) {
  app.dock.hide()
}

const store = new Store({ schema })

function getLocale() {
  const locale = app.getLocale()

  switch (locale) {
    case 'es-419' || 'es':
      return JSON.parse(readFileSync(resolve(__dirname, 'locale/es.json')).toString())
    case 'pt-BR' || 'pt-PT':
      return JSON.parse(readFileSync(resolve(__dirname, 'locale/pt.json')).toString())
    default:
      return JSON.parse(readFileSync(resolve(__dirname, 'locale/en.json')).toString())
  }
}

function render(tray = mainTray) {
  const storedProjects = store.get('projects')
  const projects = storedProjects ? JSON.parse(storedProjects) : []
  const locale = getLocale()

  const items = projects.map(({ name, path }) => ({
    label: name,
    submenu: [
      {
        label: locale.open,
        click: () => {
          spawn('code', [path], { shell: true })
        }
      },
      {
        label: locale.remove,
        click: () => {
          store.set(
            'projects',
            JSON.stringify(projects.filter((item) => item.path !== path))
          )
          render()
        }
      }
    ]
  }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: locale.add,
      click: () => {
        dialog
          .showOpenDialog({
            properties: ['openDirectory']
          })
          .then((res) => {
            const path = res.filePaths[0]
            const name = basename(path)

            store.set(
              'projects',
              JSON.stringify([
                ...projects,
                {
                  path,
                  name
                }
              ])
            )

            render()
          })
          .catch((_err) => {})
      }
    },
    {
      type: 'separator'
    },
    ...items,
    {
      type: 'separator'
    },
    {
      type: 'normal',
      label: locale.close,
      role: 'quit',
      enabled: true
    }
  ])

  tray.setContextMenu(contextMenu)

  tray.on('balloon-click', tray.popUpContextMenu)
}

app.on('ready', () => {
  mainTray = new Tray(resolve(__dirname, 'assets', 'iconTemplate.png'))

  render(mainTray)
})
