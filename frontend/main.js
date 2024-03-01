const { BrowserWindow, app, ipcMain , Menu, dialog} = require('electron');
const path = require('path');

let loginWin;

function createWindow () {
    loginWin = new BrowserWindow({
        width: 800,
        height: 600,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    loginWin.setMenu(null);
    loginWin.loadFile("Loginpage.html");
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', function (){
        if (BrowserWindow.getAllWindows().length === 0) createWindow;
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('open-new-window', () => {
    const homePage = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    loginWin.close();

    homePage.loadFile('Homepage.html');

    Menu.setApplicationMenu(null);

    showLogoutConfirmation(homePage);
});    


const showLogoutConfirmation = (homePage) => {
    const options = {
      type: 'question',
      buttons: ['Yes', 'No'],
      defaultId: 1,
      title: 'Logout Confirmation',
      message: 'Are you sure you want to log out?',
    };
  
    dialog.showMessageBox(homePage, options, (response) => {
      if (response === 0) {
        // User clicked "Yes", perform logout action here
        console.log('User clicked "Yes"');
        // Add your logout logic here
      } else {
        // User clicked "No", do nothing or handle accordingly
        console.log('User clicked "No"');
      }
    });
  };
  
  module.exports.showLogoutConfirmation = showLogoutConfirmation;