const { BrowserWindow, app, ipcMain, Menu, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const { PythonShell } = require('python-shell');





let mainWindow;
let loginWin;
let homePage;
let recordWindow;
let pythonProcess;
let serverProcess;

function createWindow() {
    loginWin = new BrowserWindow({
        width: 800,
        height: 600,
        icon: "logo.jpg",
        maximizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });
    
  
    loginWin.loadFile("Loginpage.html");
    loginWin.setMenu(null);

    
}

app.on('before-quit', () => {
    // Check if server process is running
    if (serverProcess) {
        // Kill the server process
        serverProcess.kill();
        serverProcess = null; // Reset serverProcess variable
    }
});


app.on('ready', createWindow);

app.on('activate', function () {
    if (loginWin === null) createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('open-new-window', (event, username) => {
    homePage = new BrowserWindow({
        width: 1920,
        height: 1080,
        icon: "logo.jpg",
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
        frame: false,
        icon: "logo.jpg",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js'),
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

ipcMain.on('close-record-window', () => {
    if (recordWindow) {
        recordWindow.close();
    }
});




ipcMain.on('focus-fix', () => {
    let focusedWindow = BrowserWindow.getFocusedWindow();
    if (focusedWindow) {
      focusedWindow.hide();
      focusedWindow.show();
    }
  });



  ipcMain.on('start-python-script', (event, collectionName) => {
    // Check if Python script is not already running
    if (!pythonProcess) {
        // Start the Python script
        startPythonScript(collectionName);
    }
});

ipcMain.on('stop-python-script', () => {
    // Check if Python script is running
    if (pythonProcess) {
        // Stop the Python script
        stopPythonScript();
    }
});

function startPythonScript(collectionName) {
    // Replace 'your_python_script.py' with the correct filename of your Python script
    pythonProcess = spawn('python', ['C:\\Users\\Dilusha fernando\\Desktop\\recordmate\\SDGP--SE--82\\frontend\\applicationlaunches.py', collectionName]);
    

    // Optional: Handle stdout and stderr if needed
    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    // Optional: Handle script exit event
    pythonProcess.on('exit', (code) => {
        console.log(`Python script exited with code ${code}`);
        pythonProcess = null; // Reset pythonProcess variable
    });
}

function stopPythonScript() {
    // Kill the Python process
    pythonProcess.kill();
    pythonProcess = null; // Reset pythonProcess variable
}


