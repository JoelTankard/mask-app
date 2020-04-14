'use strict'

import { app, protocol, BrowserWindow, ipcMain, systemPreferences } from 'electron'
import {
  createProtocol,
  installVueDevtools
} from 'vue-cli-plugin-electron-builder/lib';

const isDevelopment = process.env.NODE_ENV !== 'production';

const hideWorkers = true;

// Keep a global reference of the window objects, if you don't, windows will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let mathWorker;
let featureWorker;

// check if the "App" protocol has already been created
let createdAppProtocol = false;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true,
    corsEnabled: true,
    supportFetchAPI: true
  }
}]);

const createWindow = () => {

  // create the game UI window
  mainWindow = new BrowserWindow({
    width: 640,
    height: 480,
    fullscreen: false,
    autoHideMenuBar: false,
    titleBarStyle: 'hiddenInset',
    kiosk: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
  } else {
    mainWindow.loadURL('app://./index.html');
  }

  mainWindow.on('closed', () => {
    // closing the main (visible) window should quit the App
    app.quit();
  });
}

class createWorker {
  constructor(name, hide) {
    this.worker = new BrowserWindow({
      show: hide || !hideWorkers,
      webPreferences: { nodeIntegration: true }
    });
    if(process.env.WEBPACK_DEV_SERVER_URL) {
      this.worker.loadURL(process.env.WEBPACK_DEV_SERVER_URL + name);
    } else {
      this.worker.loadURL(`app://./${name}.html`)
    }

    this.worker.on('closed', () => { this.worker = null; });
    return this.worker;
  }

};

const sendWindowMessage = (targetWindow, message, payload) => {

  if(typeof targetWindow === 'undefined') {
    console.log('Target window does not exist');
    return;
  }

  targetWindow.webContents.send(message, payload);
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
});

const checkAccess = (arg) => systemPreferences.getMediaAccessStatus(arg);

let cameraAccess = checkAccess('camera');
let microphoneAccess = checkAccess('microphone');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  if(!createdAppProtocol) {
    createProtocol('app');
    createdAppProtocol = true;
  }

  // create the main application window
  createWindow();
  mathWorker = new createWorker('mathWorker');
  featureWorker = new createWorker('featureWorker');

  // setup message channels
  ipcMain.on('main', (event, arg) => {
    sendWindowMessage(mainWindow, 'main', arg);
  });

  ipcMain.on('math', (event, arg) => {
    sendWindowMessage(mathWorker, 'math', arg);
  });


  // When the dom loads check camera and mic access
  mainWindow.webContents.on('dom-ready', () => {
    sendWindowMessage(mainWindow, 'window-media-access', { camera: cameraAccess, microphone: microphoneAccess });
    sendWindowMessage(featureWorker, 'window-media-access', cameraAccess === 'granted' && microphoneAccess === 'granted');

  });

  // Ask for access when clicking toggles
  ipcMain.on('window-ask-media-access', async (event, mediaType) => {
    await systemPreferences.askForMediaAccess(mediaType);
    sendWindowMessage(mainWindow, 'window-media-access', { camera: cameraAccess, microphone: microphoneAccess })
  });

  // Let worker know access is granted when clicking Continue button
  ipcMain.on('window-confirm-media-access', () => {
    sendWindowMessage('window-media-access', cameraAccess === 'granted' && microphoneAccess === 'granted')
  })

})


// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}