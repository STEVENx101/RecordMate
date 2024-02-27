const { BrowserWindow, app } = require('electron');

const createWindow = () => {
    const loginWin = new BrowserWindow({
        width: 800,
        height: 600,
        maximizable: false,
       
    });

    loginWin.setMenu(null)
    loginWin.loadFile("Loginpage.html");
};

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
