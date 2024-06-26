const express = require('express');
const app = express();
const session = require('express-session');
const MongoDBSession = require('connect-mongodb-session')(session);
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const username = 'jamesthorley291';
const password = encodeURIComponent('iMiiCas150Penena');

// Models
const Meeting = require('./models/Meeting');
const PersonalSupervisor = require('./models/Personalsupervisor');
const SelfReport = require('./models/Selfreport');
const SeniorTutor = require('./models/Seniortutor');
const Relationship = require('./models/Relationship');
const Student = require('./models/Student');




const mongoUri = `mongodb+srv://${username}:${password}@cluster0.jxgtgxt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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



// Login route
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
      console.error(`Login attempt with invalid user type: ${userType}`);
      res.status(400).send("Invalid user type");
      return;
  }

  try {
    const user = await model.findOne({ username: username.trim() });
    if (!user) {
      console.error(`Login failed for non-existent username: ${username}`);
      return res.redirect('/login'); // Consider using flash messages for user feedback
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.error(`Password mismatch for user: ${username}`);
      return res.redirect("/login"); // Consider using flash messages for user feedback
    }

    req.session.isAuth = true;
    req.session.userId = user._id;
    req.session.userType = userType;
    console.log(`User ${username} logged in as ${userType}`);

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
    console.error(`Error during login for ${username}: ${err.message}`, err);
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

app.post('/reports/create', isAuth , async (req, res) => {
  // Check for authentication first
  if (!req.session.isAuth) {
      return res.status(401).send('Unauthorized: No access to create reports.');
  }

  // Extract data from the request body
  const { reportContent, reportDate = new Date() } = req.body;

  // Retrieve the studentId from session (assuming you store this upon login)
  const studentId = req.session.userId;  // Adjust based on your session setup

  if (!reportContent) {
      return res.status(400).send('Report content is required.');
  }

  try {
      // Create a new self report using the SelfReport model
      const newSelfReport = new SelfReport({
          studentId: studentId,
          reportContent: reportContent,
          reportDate: reportDate
      });

      // Save the new self report to the database
      await newSelfReport.save();

      // Send a success response back to the client
      res.status(201).send({ message: 'Self report created successfully', reportId: newSelfReport._id });
  } catch (error) {
      console.error('Failed to create self report:', error);
      res.status(500).send('Error creating self report');
  }
});

app.get('/reports/self', async (req, res) => {
  try {
      const studentId = req.session.userId;  // Make sure this is correctly set
      console.log("Fetching reports for student ID:", studentId);  // Debugging output

      const reports = await SelfReport.find({ studentId: studentId }).exec();  // Ensure proper execution
      console.log("Reports found:", reports);  // Debugging output

      res.json({ reports });  // Send the reports back to the client
  } catch (error) {
      console.error('Error fetching self reports:', error);
      res.status(500).send('Failed to retrieve self reports.');
  }
});



// Serve HTML files
app.get('/studentDashboard', isAuth, (req, res) => {
  if (req.session.userType === 'student') {
    res.sendFile(path.join(__dirname, 'public' ,'studentDashboard.html'));
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

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public' ,'login.html'));
});


app.get('/', (req, res) => {
  res.redirect('/login.html');
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});