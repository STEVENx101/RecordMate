<<<<<<< Updated upstream
const {BrowserWindow, app} = require('electron');
=======
const { BrowserWindow, app } = require('electron');
>>>>>>> Stashed changes

const createWindow = () => {
    const loginWin = new BrowserWindow({
        width: 800,
<<<<<<< Updated upstream
        height: 600
    })

    win.loadFile("index.html")
}


=======
        height: 600,
        maximizable: false,
       
    });

    loginWin.setMenu(null)
    loginWin.loadFile("Loginpage.html");
};
>>>>>>> Stashed changes

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
<<<<<<< Updated upstream
    if (process.platform !== 'darwin') app.quit()
})
=======
    if (process.platform !== 'darwin') app.quit();
});
>>>>>>> Stashed changes
