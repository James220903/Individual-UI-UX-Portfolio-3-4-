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
const User = require('./models/User');
const Book = require('./models/Book');
const Message = require('./models/Message');

const mongoUri = `mongodb+srv://${username}:${password}@cluster0.qvjhqe8.mongodb.net/`;
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



// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.trim() });
  if (!user) {
    return res.redirect('/login');
  }
  const isMatch = await bcrypt.compare(password.trim(), user.password);
  if (!isMatch) {
    return res.redirect("/login");
  }
  req.session.isAuth = true;
  req.session.userId = user._id;
  res.redirect('/home');
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



// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});