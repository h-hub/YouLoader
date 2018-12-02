const { app, BrowserWindow, ipcMain, IpcMessageEvent } = require("electron");
const path = require("path");
const youtTubeutil = require('./server-side-modules/ytdl');
const youtTubeutilIns = new youtTubeutil();
const url = require('url');

let win;

function createWindow() {
    win = new BrowserWindow({ width: 1500, height: 700 });
    win.setMenu(null)

    // and load the index.html of the app.
    win.loadFile(path.join(__dirname, `/dist/index.html`))

    // win.loadURL(url.format({
    //     pathname: path.join(__dirname, '/dist/index.html'),
    //     protocol: 'file:',
    //     slashes: true,
    //     hash: '/about'
    //   }));

    win.webContents.openDevTools()

    // The following is optional and will open the DevTools:
    // win.webContents.openDevTools()

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
    youtTubeutilIns.downloadVideo(arg, event);
});

ipcMain.on('getVideoTitle', (event, arg) => {
    youtTubeutilIns.getName(arg, event);
});

ipcMain.on('stopDownload', (event, arg) => {
    youtTubeutilIns.stopDownload(arg, event);
});

ipcMain.on('load-page', (event, arg) => {

    let child = new BrowserWindow({ parent: win, modal: true, show: false })
    child.loadURL(path.join(__dirname, `/dist/YouLoaderFileUtil/index.html`))
    child.once('ready-to-show', () => {
        child.show()
    })

});
