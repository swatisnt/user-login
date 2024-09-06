const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const fs = require('fs');
const https = require('https');
const http = require('http');
const User = require('./models/user');

const app = express();
const PORT = 3000; // Development port
const HTTPS_PORT = 3443; // Port for HTTPS

// Load certificates
const privateKey = fs.readFileSync('C:/Users/umesh sharma/key.pem', 'utf8');
const certificate = fs.readFileSync('C:/Users/umesh sharma/cert.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate };

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userdb', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Encryption/Decryption functions
const secret = 'your-secret-key'; // Replace this with a more secure key

const encrypt = (text) => {
  const cipher = crypto.createCipher('aes-256-cbc', secret);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
};

const decrypt = (encryptedText) => {
  const decipher = crypto.createDecipher('aes-256-cbc', secret);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Registration Route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const encryptedUsername = encrypt(username);
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username: encryptedUsername,
    password: hashedPassword
  });

  try {
    await newUser.save();
    res.send({ success: true, message: 'Registration successful', redirect: '/' });
  } catch (error) {
    res.status(500).send({ success: false, message: 'Error registering user' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const encryptedUsername = encrypt(username);

  try {
    const user = await User.findOne({ username: encryptedUsername });

    if (user && await bcrypt.compare(password, user.password)) {
      res.json({ success: true, message: 'Login successful', redirect: '/' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Redirect HTTP to HTTPS
const httpApp = express();
httpApp.use((req, res) => {
  res.redirect(`https://${req.headers.host}${req.url}`);
});

http.createServer(httpApp).listen(3000, () => {
  console.log('HTTP server running on port 3000');
});

https.createServer(credentials, app).listen(HTTPS_PORT, () => {
  console.log(`HTTPS server running on port ${HTTPS_PORT}`);
});
