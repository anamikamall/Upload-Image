require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const User = require('./models/User');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000' // Allow requests from this origin
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/image_upload_app", {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Middleware to authenticate user
function authenticateToken(req, res, next) {
    
  // const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
  const token = req.headers['authorization'];
  // console.log(token);
  if (!token) return res.sendStatus(401); // Return 401 Unauthorized if token is missing

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
  if (err) {
    console.error('JWT verification error:', err.message);
    return res.sendStatus(401); // Return 401 Unauthorized if token is invalid
  }
  console.log('User authenticated:', user);
  req.user = user;
  next();
});
/*try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error('Authentication failed!');
    }
    const verified = jwt.verify(token, 'secret');
    req.user = verified;  
    next();
  } catch (err) {
    res.status(400).send('Invalid token !');
  }*/
}


// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// Routes
app.post('/signup', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword
    });
    await user.save();
    res.status(201).send('User created successfully');
  } catch {
    res.status(500).send('Failed to create user');
  }
});

app.post('/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).send('User not found');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid password');

  const accessToken = jwt.sign({ username: user.username }, process.env.SECRET_KEY);
  res.json({ accessToken: accessToken });
});

app.post('/upload', authenticateToken, upload.single('image'), (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: You need to login to upload images.' });
    }
    // Check if file is present in the request
    if (!req.file) {
      return res.status(400).json({ error: 'Bad Request: No file uploaded.' });
    }

    // Log the filename received by the server
    console.log('Filename:', req.file.filename);

    // File upload logic
    // Access uploaded file details using req.file
    const { filename, mimetype, size } = req.file;

    // Return success response
    res.status(200).json({
      message: 'Image uploaded successfully',
      filename: filename,
      mimetype: mimetype,
      size: size
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
