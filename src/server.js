require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { initializeCasbin } = require('./middlewares/enforcer');
const routes = require('./routes');
const path = require('path');
const app = express();

// Initialize Casbin at the start
initializeCasbin().then(() => {
    console.log('Casbin initialized successfully');
  }).catch((err) => {
    console.error('Error initializing Casbin:', err);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
