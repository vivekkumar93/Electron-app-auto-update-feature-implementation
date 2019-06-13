// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const {autoUpdater} = require("electron-updater");
const log = require("electron-log");
let win; // this will store the window object

// Setup logger
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// creates the default window
function createDefaultWindow() {
  win = new BrowserWindow({width: 900, height: 680});
  win.setMenuBarVisibility(false);
  win.loadURL(`file://${__dirname}/index.html`);
  win.on('closed', () => app.quit());
return win;
}

// when the app is loaded create a BrowserWindow and check for updates
app.on('ready', function() {
createDefaultWindow()
autoUpdater.checkForUpdates();
});

autoUpdater.on('checking-for-update', function () {
  sendStatusToWindow('Checking for update...');
});

autoUpdater.on('update-available', function (info) {
  sendStatusToWindow('Update available.');
});

autoUpdater.on('update-not-available', function (info) {
  sendStatusToWindow('Update not available.');
});

autoUpdater.on('error', function (err) {
  sendStatusToWindow('Error in auto-updater.');
});

autoUpdater.on('download-progress', function (progressObj) {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + parseInt(progressObj.percent) + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Restart the application to apply the updates.'
  }

  dialog.showMessageBox(dialogOpts, (response) => {
    if (response === 0) autoUpdater.quitAndInstall()
  })
})

// autoUpdater.on('update-downloaded', function (info) {
//     sendStatusToWindow('Update downloaded; will install in 1 seconds');
// });

// autoUpdater.on('update-downloaded', function (info) {
//     setTimeout(function () {
//         autoUpdater.quitAndInstall();
//     }, 1000);
// });

//autoUpdater.checkForUpdates();

function sendStatusToWindow(message) {
  console.log(message);
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
