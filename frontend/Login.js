
        document.addEventListener("DOMContentLoaded", function() {
            console.log("Document loaded"); // Check if JavaScript code is executed
            document.getElementById("loginBtn").addEventListener("click", function(event) {
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
                        if(loginbtn){
                        loginbtn.addEventListener('click', () => {
                                ipcRenderer.send('open-new-window');
                        }); 

                         }
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
        });
   