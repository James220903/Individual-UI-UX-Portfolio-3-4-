const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const username = 'jamesthorley1';
const password = encodeURIComponent('UUWwZxL9Wdm2VHnk');

// Models
const Meeting = require('./models/Meeting');
const PersonalSupervisor = require('./models/Personalsupervisor');
const SelfReport = require('./models/Selfreport');
const SeniorTutor = require('./models/Seniortutor');
const Relationship = require('./models/Relationship');
const Student = require('./models/Student');




const mongoUri = `mongodb+srv://${username}:${password}@cluster0.qvjhqe8.mongodb.net/myapp`;
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const store = new MongoDBSession({
  uri: mongoUri,
  collection: 'mySessions',
});

app.use(session({
  secret: 'key that will sign cookie',
  resave: false,
  saveUninitialized: false,
  store: store,
}));

const isAuth = (req, res, next) => {
  if (req.session.isAuth) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));



app.post("/login", async (req, res) => {
  const { username, password, userType } = req.body;

  let model;
  switch (userType) {
    case 'student':
      model = Student;
      break;
    case 'personalSupervisor':
      model = PersonalSupervisor;
      break;
    case 'seniorTutor':
      model = SeniorTutor;
      break;
    default:
      return res.status(400).send("Invalid user type");  // Handling unexpected user types
  }

  try {
    const user = await model.findOne({ username: username.trim() });
    if (!user) {
      return res.redirect('/login');  // User not found, redirect to login
    }
    const isMatch = await bcrypt.compare(password.trim(), user.passwordHash);
    if (!isMatch) {
      return res.redirect("/login");  // Password does not match, redirect to login
    }
    req.session.isAuth = true;
    req.session.userId = user._id;
    req.session.userType = userType;  // Store user type in session

    // Redirect based on user type
    switch (userType) {
      case 'student':
        res.redirect('/studentDashboard');
        break;
      case 'personalSupervisor':
        res.redirect('/supervisorDashboard');
        break;
      case 'seniorTutor':
        res.redirect('/seniorTutorDashboard');
        break;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Login error");
  }
});

// User logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
      res.status(500).send('Could not log out, please try again.');
    } else {
      res.clearCookie('connect.sid');
      res.redirect('/login');
    }
  });
});

// Serve HTML files
app.get('/studentDashboard', isAuth, (req, res) => {
  if (req.session.userType === 'student') {
    res.sendFile(path.join(__dirname, 'views', 'studentDashboard.html'));
  } else {
    res.status(403).send("Access Denied");
  }
});

app.get('/supervisorDashboard', isAuth, (req, res) => {
  if (req.session.userType === 'personalSupervisor') {
    res.sendFile(path.join(__dirname, 'views', 'supervisorDashboard.html'));
  } else {
    res.status(403).send("Access Denied");
  }
});

app.get('/seniorTutorDashboard', isAuth, (req, res) => {
  if (req.session.userType === 'seniorTutor') {
    res.sendFile(path.join(__dirname, 'views', 'seniorTutorDashboard.html'));
  } else {
    res.status(403).send("Access Denied");
  }
});




// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});