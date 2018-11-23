const { app, BrowserWindow, ipcMain, IpcMessageEvent } = require("electron");
const path = require("path");
const url = require("url");
const fs = require('fs');
const ytdl = require('ytdl-core');
const readline = require('readline');

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
    downloadVideo(arg, event);
});

function downloadVideo(url, event) {

    const video = ytdl(url, { filter: 'audioonly' });

    ytdl.getInfo(url, function (err, info) {
        
        var title = info.title;

        const output = path.resolve(__dirname + '/mp3s', title + '.mp3');

        let starttime;
        video.pipe(fs.createWriteStream(output));

        video.once('response', () => {
            starttime = Date.now();
        });
        video.on('progress', (chunkLength, downloaded, total) => {
            const floatDownloaded = downloaded / total;
            const downloadedMinutes = (Date.now() - starttime) / 1000 / 60;
            event.sender.send('asynchronous-reply', `${(floatDownloaded * 100).toFixed(2)}%`);
        });
        video.on('end', () => {

        });
    });
}