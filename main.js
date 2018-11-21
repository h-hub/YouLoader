const { app, BrowserWindow, ipcMain, IpcMessageEvent } = require("electron");
const path = require("path");
const url = require("url");
const fs = require('fs');
const ytdl = require('ytdl-core');

let win;

function createWindow() {
  win = new BrowserWindow({ width: 820, height: 700 });
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

ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')
})

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
  event.returnValue = 'pong'
})

ipcMain.on('ping', (event, arg) => {
  console.log(arg);
  event.sender.send('pong');
  ytdl(arg)
  .pipe(fs.createWriteStream('video.mp4'))
});
