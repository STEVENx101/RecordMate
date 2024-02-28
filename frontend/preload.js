const { ipcRenderer} = require('electron');

document.addEventListener('DOMContentLoaded', () =>{
    const btn = document.getElementById('loginBtn');
    if(btn){
        btn.addEventListener('click', () => {
            ipcRenderer.send('open-new-window');
        });

    }
})