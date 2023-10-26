// main.js
require('dotenv').config({
    path: "config.env"
});
// Modules to control app life and create native browser window
const { shell, app, BrowserWindow, dialog, ipcMain, Tray, Menu, globalShortcut, Notification, ipcRenderer   } = require('electron')
const path = require('node:path')
const { fs } = require("fs")
const { Client } = require("@notionhq/client")
const { exec } = require("child_process");
const { isNull } = require('node:util');
const { window } = require('electron').BrowserWindow


const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 200,
    title: "Notion Quick-Add",
    transparent: true,
    icon: path.join(__dirname, "./assets/logo.svg"),
    frame: false,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
    }
  })
    let tray = null;
    const template = [
        {
            label: 'Config',
            submenu: [{
                label: 'Open Config',
                click() { setnotionsecret() }
            }]
        }
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
    mainWindow.loadFile('index.html')
    app.setAppUserModelId("Notion Quick Add");
    function createTray() {
        let appIcon = new Tray(path.join(__dirname, "./assets/logo.svg"));
        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Show', click: function () {
                    mainWindow.show();
                }
            },
            {
                label: 'Exit', click: function () {
                    app.isQuiting = true;
                    app.quit();
                }
            }
        ]);
    
        appIcon.on('double-click', function (event) {
            mainWindow.show();
        });
        appIcon.setToolTip('Tray Tutorial');
        appIcon.setContextMenu(contextMenu);
        return appIcon;
    }
    mainWindow.on('minimize', function (event) {
        mainWindow.hide();
    });
    
    mainWindow.on('restore', function (event) {
        mainWindow.show();
        tray.destroy();
    });
  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}
function setnotionsecret(){
    exec("notepad config.env", (error, stdout, stderr) => {
        const mainWindow = new BrowserWindow({
            width: 800,
            height: 200,
            title: "Notion Quick-Add",
            icon: path.join(__dirname, "./assets/logo.svg"),
            frame: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
          })
        if (error) {
            dialog.showMessageBox(mainWindow,{
                message: "Error while updating configuration, try again",
                type: "error",
                buttons: [],
                defaultId: 0,
                title: "Notion Quick-Add",
                icon: path.join(__dirname, "./assets/logo.svg"),
            }
            ).then((res) => {
                console.log(res);
                if(res.response === 0){
                }
            });
            return
        }
        
        if (stderr) {
            dialog.showMessageBox(mainWindow,{
                message: "Error while updating configuration, try again",
                type: "error",
                buttons: [],
                defaultId: 0,
                title: "Notion Quick-Add",
                icon: path.join(__dirname, "./assets/logo.svg"),
            }
            ).then((res) => {
                console.log(res);
                if(res.response === 0){
                }
            });
            return;
        }
        dialog.showMessageBox(mainWindow,{
            message: "Configuration updated successfully",
            type: "info",
            buttons: [],
            defaultId: 0,
            title: "Notion Quick-Add",
            icon: path.join(__dirname, "./assets/logo.svg"),
        }
        ).then((res) => {
            console.log(res);
            if(res.response === 0){
                app.exit()
            }
        });

        });
}
function getwindow(){
    const current = BrowserWindow.getFocusedWindow()
    try{
        current.hide()
    } 
    catch (error) {

    }

}
function showwindow(){
    const current = BrowserWindow.getAllWindows()
    try{
        current[0].show()
    } 
    catch (error) {

    }
}
async function addToDatabase(notion, tasks) {
    try {
        const response = await notion.pages.create({
            parent: {
                database_id: process.env.DATABASE_ID,
            },
            properties: {
                'Name' : {
                        type: 'title',
                        title: [{ "type": "text", "text": { "content": tasks } }]
                },
            }    
        });
        try {
            const r = await notion.databases.retrieve({
                database_id: process.env.DATABASE_ID
            })
            new Notification({
                title: "Notion Quick-Add",
                body: "La tarea '"+tasks+"' ha sido añadida a "+r.title[0].text.content,
                silent: false,
                icon: path.join(__dirname, "./assets/logo.svg")
              }).show()
            BrowserWindow.getFocusedWindow().hide()
        } catch (error){
            console.error(error.body);
        }
        
    } catch (error) {
        console.error(error.body);
    }
}
function quickadd(){
    
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Algunas APIs pueden solamente ser usadas despues de que este evento ocurra.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for apps and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('ready', () => {
    const current = BrowserWindow.getFocusedWindow()
    globalShortcut.register(process.env.SHORTCUT, showwindow)
    globalShortcut.register(process.env.SHORTCUT_CLOSE, getwindow)
    globalShortcut.register(process.env.SHORTCUT_CONFIG, setnotionsecret)
})
app.on('window-all-closed', (e) => {
    e.preventDefault()
    e.returnValue = false
  })

// In this file you can include the rest of your app's specific main process
// code. Tu también puedes ponerlos en archivos separados y requerirlos aquí.
ipcMain.on("task", (event, tasks) => {
    const notion = new Client({
        auth: process.env.NOTION_TOKEN,
    })
    addToDatabase(notion, tasks);
    }); 
