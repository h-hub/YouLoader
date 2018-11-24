const { app, BrowserWindow, ipcMain, IpcMessageEvent } = require("electron");
const path = require("path");
const youtTubeutil = require('./server-side-modules/ytdl');
const youtTubeutilIns = new youtTubeutil();

let win;

function createWindow() {
    win = new BrowserWindow({ width: 950, height: 700 });
    win.setMenu(null)

    // and load the index.html of the app.
    win.loadFile(path.join(__dirname, `/dist/index.html`))
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