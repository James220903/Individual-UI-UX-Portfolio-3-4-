const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Use express-session
app.use(session({
    secret: 'your_secret_key', // Change to a secret key of your choice
    resave: false,
    saveUninitialized: true
}));

// Dummy user for demonstration purposes
// Dummy users for demonstration purposes
const DUMMY_USERS = [
    { username: 'student', password: 'pass', role: 'Student' },
    { username: 'personal_supervisor', password: 'pass', role: 'PS' },
    { username: 'senior_tutor', password: 'pass', role: 'ST' }
];


// Body parser to parse form data
app.use(express.urlencoded({ extended: true }));

// Route for serving the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route for handling the login
// Route for handling the login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check for user in dummy users array
    const user = DUMMY_USERS.find(u => u.username === username && u.password === password);

    if (user) {
        // Set user information and role in session
        req.session.user = { username: user.username, role: user.role };
        res.redirect('/dashboard'); // Redirect to the dashboard or another secure page
    } else {
        res.send('Invalid credentials');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        switch (req.session.user.role) {
            case 'Student':
                res.send('Welcome to the Student dashboard, ' + req.session.user.username + '!');
                break;
            case 'PS':
                res.send('Welcome to the Personal Supervisor dashboard, ' + req.session.user.username + '!');
                break;
            case 'ST':
                res.send('Welcome to the Senior Tutor dashboard, ' + req.session.user.username + '!');
                break;
            default:
                res.send('Unauthorized role');
                break;
        }
    } else {
        res.redirect('/login');
    }
});

// Route for secure page
app.get('/secure-page', (req, res) => {
    if (req.session.user) {
        res.send('Welcome to the secure page, ' + req.session.user + '!');
    } else {
        res.redirect('/login');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});
