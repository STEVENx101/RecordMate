const { ipcRenderer, dialog } = require('electron');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const emailValidator = require("email-validator");
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const folderPath = '..\\frontend'; // Specify your folder path here

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'
});

// Define user model
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }
});

// Hash password before saving
User.beforeCreate(async (user) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(user.password, salt);
  user.password = hash;
});

// Routes
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!emailValidator.validate(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create user
    await User.create({ username, password, email });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    res.status(200).json({ message: 'Login successful', username: user.username });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files (like index.html)
app.use(express.static(__dirname));

/// File server route for searching files
app.get('/files', (req, res) => {
  const searchTerm = req.query.q || '';
  fs.readdir(folderPath, (err, files) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error reading folder.');
          return;
      }

      const filteredFiles = files.filter(file => {
          // Check if the file name includes the search term and ends with '.db'
          return file.toLowerCase().includes(searchTerm.toLowerCase()) && file.endsWith('.db');
      });

      if (filteredFiles.length === 0) {
          res.send('<p>No captures found for the searched term. Try again!!</p>');
      } else {
          const fileLinks = filteredFiles.map(file => {
              return `
                  <div class="incoming">
                      <p>${file}</p>
                      <button onclick="deleteFile('${file}' )">Delete</button>
                      <button onclick="view('${file}')">View</button>
                  </div>`;
          }).join('<br>');

          res.send(`${fileLinks}`);
      }
  });
});

// File server route for serving individual files
app.get('/file/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(folderPath, fileName);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error(err);
            res.status(404).send('File not found.');
            return;
        }
        res.setHeader('Content-Type', 'text/html');
        res.send(data);
    });
});

// Route for deleting a file
app.delete('/deleteFile', (req, res) => {
  const fileName = req.query.fileName;
  const filePath = path.join(folderPath, fileName);

  fs.unlink(filePath, (err) => {
      if (err) {
          console.error('Error deleting file:', err);
          res.status(500).json({ error: 'Error deleting file' });
      } else {
          console.log('File deleted successfully');
          res.status(200).send('File deleted successfully');
      }
  });
});


// Sync models with the database and start the server
sequelize.sync().then(() => {
  console.log('Connected to SQLite database');

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Error connecting to SQLite database:', error);
});

document.addEventListener('DOMContentLoaded', () => {
    const logoutbtn = document.getElementById('logoutBtn');
    const startBtn = document.getElementById('startBtn');
    const closeRecordBtn = document.getElementById('closeRecordBtn');
    const createBtn = document.getElementById('createBtn');
    const stopBtn = document.getElementById('stopBtn');
    


    if (logoutbtn) {
        logoutbtn.addEventListener('click', () => {
            ipcRenderer.send('open-logout-window');
        });
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            const collectionName = document.getElementById('collectionName').value;
            ipcRenderer.send('start-python-script', collectionName);
            ipcRenderer.send('minimize-record-window');
        });
    }

    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            ipcRenderer.send('stop-python-script');
            ipcRenderer.send('open-Saved-window');
            ipcRenderer.send('close-record-window');
        });
    }

    if (closeRecordBtn) {
        closeRecordBtn.addEventListener('click', () => {
            // Send a message to the main process to close the recordWindow
            ipcRenderer.send('close-record-window');
        });
    }

    if (createBtn) {
        createBtn.addEventListener('click', () => {
            ipcRenderer.send('open-record-window');
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
                        ipcRenderer.send('focus-fix');
                    });
                }
            })
            .catch(error => {
                console.error("Error:", error);
            });
        });
    }
});


function searchFiles() {
    var searchTerm = document.getElementById('searchInput').value.trim();
  
    // Check if the search term is empty
    if (searchTerm === '') {
      document.getElementById('fileList').innerHTML = '<p>Please enter a search term!</p>';
      return;
    }
  
    fetch(`http://localhost:3000/files?q=${searchTerm}`)
        .then(response => response.text())
        .then(data => {
            // Check if the response data indicates no matching files
            if (data.trim() === '') {
              document.getElementById('fileList').innerHTML = '<p>No files found</p>';
            } else {
              document.getElementById('fileList').innerHTML = data;
            }
        })
        .catch(error => console.error('Error fetching file list:', error));
  }
  
  

// Add this code to the end of your preload.js to attach the event listener to the search button
document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
      searchBtn.addEventListener('click', searchFiles);
  }
});

function deleteFile(fileName) {
  fetch(`http://localhost:3000/deleteFile?fileName=${fileName}`, {
      method: 'DELETE'
  })
  .then(response => {
      if (response.ok) {
          // Reload the search results after deletion
          searchFiles();
      } else {
          console.error('Failed to delete file:', response.statusText);
      }
  })
  .catch(error => console.error('Error deleting file:', error));
}








document.addEventListener('DOMContentLoaded', () => {
  console.log("Document loaded"); // Check if JavaScript code is executed

  
  const createAccountBtn = document.getElementById('createAccountBtn');

  if (createAccountBtn) {
      createAccountBtn.addEventListener('click', function(event) {
          event.preventDefault(); // Prevent default form submission behavior

          console.log("Create account button clicked"); // Check if the create account button is clicked

          // Get the values of email, username, and password
          var email = document.getElementById('email').value;
          var username = document.getElementById('username').value;
          var password = document.getElementById('password').value;

          // Create an object with email, username, and password
          var formData = {
              email: email,
              username: username,
              password: password
          };

          // Send a POST request to your backend with the registration data
          fetch('http://localhost:3000/register', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
          })
          .then(response => {
              if (response.ok) {
                  // Redirect or perform actions after successful registration
                  window.location.href = 'Loginpage.html';
                  
              } else {
                  // Handle error response
                  return response.json().then(data => {
                      alert(data.error); // Show error message
                      ipcRenderer.send('focus-fix');
                  });
              }
          })
          .catch(error => {
              console.error('Error:', error);
          });
      });
  }

  // Other event listeners and code from your original JavaScript file can be added here
});



document.addEventListener("DOMContentLoaded", function() {
  // Assuming you have a link element with id 'retrieveLink' in your HTML
  const retrieveLink = document.getElementById('List');

  // Add a click event listener to the link
  retrieveLink.addEventListener('click', () => {
      ipcRenderer.send('run-python-script');
  });
});


document.addEventListener("DOMContentLoaded", function () {
  const fileList = document.getElementById('List');
  const searchParams = new URLSearchParams(window.location.search);
  const collectionName = searchParams.get('collection');

  // Check if collectionName is not null
  if (collectionName) {
      const links = document.querySelectorAll('.returnResult');
      links.forEach(link => {
          link.href += `?collection=${collectionName}`;
      });
  }
});

function view(fileName) {
    const collectionName = fileName.split('.')[0]; // Extract the collection name from the file name
    ipcRenderer.send('view-file', collectionName);
}


