const { ipcRenderer, dialog} = require('electron');

document.addEventListener('DOMContentLoaded', () =>{
    const loginbtn = document.getElementById('loginBtn');
    const logoutbtn = document.getElementById('logoutBtn');
    const recordWindowbtn = document.getElementById('recordBtn');

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
    
});














