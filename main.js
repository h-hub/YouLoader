const { app, BrowserWindow, ipcMain, ipcRenderer } = require("electron");
const path = require("path");
const youtTubeutil = require('./server-side-modules/ytdl');
const Store = require('./server-side-modules/store');
const youtTubeutilIns = new youtTubeutil();
const url = require('url');

let win;

const store = new Store({
    configName: 'user-preferences',
    defaults: {
        windowBounds: { width: 800, height: 600 },
        mp3files: []
    }
});

function createWindow() {

    let { width, height } = store.get('windowBounds');
    win = new BrowserWindow({ width, height });

    win.on('resize', () => {
        let { width, height } = win.getBounds();
        store.set('windowBounds', { width, height });
    });

    win.setMenu(null)

    win.loadFile(path.join(__dirname, `/dist/index.html`));

    win.webContents.on('did-finish-load', () => {
        win.webContents.send('initData', store.get("mp3files"))
    });

    win.webContents.openDevTools();

    win.on("closed", () => {
        win = null;
    });
}

app.on("ready", createWindow);

// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// initialize the app's main window
app.on("activate", () => {
    if (win === null) {
        createWindow();
    }
});

ipcMain.on('download', (event, arg) => {
    youtTubeutilIns.downloadVideo(arg, event, store);
});

ipcMain.on('stopDownload', (event, arg) => {
    youtTubeutilIns.stopDownload(arg, event, store);
});

ipcMain.on('deleteDownload', (event, arg) => {
    youtTubeutilIns.deleteDownload(arg, event, store);
});

ipcMain.on('load-page', (event, arg) => {

    let child = new BrowserWindow({ parent: win, modal: true, show: false })
    child.loadURL(path.join(__dirname, `/fileutil/dist/fileutil/index.html`))
    child.once('ready-to-show', () => {
        child.show()
    })

});

