const { BrowserWindow, app, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const fs = require('fs');


let loginWin;
let homePage;
let recordWindow;

function createWindow() {
    loginWin = new BrowserWindow({
        width: 800,
        height: 600,
        maximizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    
    loginWin.setMenu(null);
    loginWin.loadFile("Loginpage.html");

}


app.on('ready', createWindow);

app.on('activate', function () {
    if (loginWin === null) createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('open-new-window', () => {
    homePage = new BrowserWindow({
        width: 1920,
        height: 1080,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    loginWin.close();

    homePage.once('ready-to-show', () => {
        homePage.show();
        homePage.setSize(1920, 1080);
    });

    homePage.loadFile('Homepage.html');

    homePage.setMenu(null);

});

ipcMain.on('open-record-window', () => {
  recordWindow = new BrowserWindow({
      width: 300,
      height: 200,
      frame:false,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
      },
  });

  recordWindow.loadFile('Recordpage.html');
  recordWindow.setMenu(null);
});




ipcMain.on('show-logout-confirmation', () => {
    // Open the logout confirmation dialog
    showLogoutConfirmation(loginWin);
});

ipcMain.on('open-logout-window', () => {
    // Call the optionbar function to open the dialog
    optionbar(homePage);
});

// Define the optionbar function
const optionbar = (homePage) => {
    const options = {
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 1,
        title: 'Logout Confirmation',
        message: 'Are you sure you want to log out?',
    };

    dialog.showMessageBox(homePage, options).then((response) => {
        if (response.response === 0) {
            homePage.close();
            createWindow();
        } else {
            console.log('User clicked No');
        }
    });
};

ipcMain.on('close-record-window', ()=>{
    if(recordWindow){
        recordWindow.close();
    }
});



