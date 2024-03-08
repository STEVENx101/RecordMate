const { ipcRenderer, dialog} = require('electron');

document.addEventListener('DOMContentLoaded', () =>{
    const loginbtn = document.getElementById('loginBtn');
    const logoutbtn = document.getElementById('logoutBtn');
    const recordWindowbtn = document.getElementById('recordBtn');
    const closeRecordBtn = document.getElementById('closeRecordBtn');
    
    if(loginbtn){
        loginbtn.addEventListener('click', () => {
            ipcRenderer.send('open-new-window');
        });

    }

    if(logoutbtn){
        logoutbtn.addEventListener('click', () => {
            ipcRenderer.send('open-logout-window');
        });
    }

    if(recordWindowbtn){
        recordWindowbtn.addEventListener('click', () => {
            ipcRenderer.send('open-record-window');
        });
    }

    if (closeRecordBtn) {
        closeRecordBtn.addEventListener('click', () => {
            // Send a message to the main process to close the recordWindow
            ipcRenderer.send('close-record-window');
        });
    }
    
});
















