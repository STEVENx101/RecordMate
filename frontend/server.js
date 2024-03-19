const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const emailValidator = require("email-validator");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/local');

// Define user schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

// Create User model
const User = mongoose.model('User', userSchema);

// Hash password before saving
userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        next();
    } catch (error) {
        return next(error);
    }
});

// Routes
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!emailValidator.validate(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Generate a unique database name based on username
        const dbName = `user_${username}`;

        // Check if the database already exists
        const dbExists = await mongoose.connection.db.admin().listDatabases();
        if (dbExists.databases.some(db => db.name === dbName)) {
            return res.status(400).json({ error: 'Database already exists for this user' });
        }

        // Create a new database
        const newDb = await mongoose.connection.useDb(dbName);

        // Create user model for the new database
        const UserModel = newDb.model('User', userSchema);

        // Create user document in the new database
        const newUser = new UserModel({ username, password, email });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user's database based on the username
        const dbName = `user_${username}`;
        const db = mongoose.connection.useDb(dbName);

        // Define user schema for the specific database
        const userSchema = new mongoose.Schema({
            username: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            email: { type: String, required: true, unique: true }
        });

        // Get the User model for the specific database
        const UserModel = db.model('User', userSchema);

        // Find the user by username
        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Passwords match, user is authenticated
        res.status(200).json({ message: 'Login successful', username: user.username });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Once the connection is established, register the schema and start the server
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');

    // Start the server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

// If there's an error connecting to MongoDB
mongoose.connection.on('error', err => {
    console.error('Error connecting to MongoDB:', err);
});
