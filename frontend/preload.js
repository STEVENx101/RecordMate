const { ipcRenderer, dialog} = require('electron');

document.addEventListener('DOMContentLoaded', () =>{
    
    const logoutbtn = document.getElementById('logoutBtn');
    const recordWindowbtn = document.getElementById('recordBtn');
    const closeRecordBtn = document.getElementById('closeRecordBtn');
    

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

document.addEventListener("DOMContentLoaded", function() {
    console.log("Document loaded"); // Check if JavaScript code is executed
    const loginBtn = document.getElementById("loginBtn");

    if (loginBtn) {
        loginBtn.addEventListener("click", function(event) {
            event.preventDefault(); // Prevent default form submission behavior

            console.log("Login button clicked"); // Check if the login button is clicked

            // Get the values of username and password
            var username = document.getElementById("username").value;
            var password = document.getElementById("password").value;

            // Create an object with username and password
            var data = {
                username: username,
                password: password
            };

            // Send a POST request to your backend with the login data
            fetch("http://localhost:3000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.ok) {
                    // Redirect or perform actions after successful login
                    window.location.href = 'Homepage.html';
                    ipcRenderer.send('open-new-window');
                } else {
                    // Handle error response
                    return response.json().then(data => {
                        alert(data.error); // Show error message
                    });
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
        });
    }
});















