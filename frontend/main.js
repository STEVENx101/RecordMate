const { BrowserWindow, app, ipcMain , Menu} = require('electron');
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
});    

