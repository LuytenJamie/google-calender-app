const jwt = require('jsonwebtoken');
const path = require('path');
const { getEnforcer } = require('./enforcer'); // Import Casbin enforcer

exports.authorize = (obj, act) => async (req, res, next) => {
    const token = req.cookies.auth;
  
    if (!token) return res.status(401).send('Not authenticated');
  
    try {
      const { email } = jwt.verify(token, process.env.SESSION_SECRET);
  
      const enforcer = getEnforcer(); // Get the initialized enforcer
  
      // If enforcer is not yet initialized, return error
      if (!enforcer) return res.status(500).send('Enforcer not initialized');
  
      // Perform the authorization check
      const allowed = await enforcer.enforce(email, obj, act);
  
      if (!allowed) return res.status(403).send('Access denied');
  
      // Proceed with the next middleware or route handler
      next();
    } catch (error) {
      console.error('Authorization Error:', error);
      res.status(403).send('Access denied');
    }
};

exports.isAuthenticated = (req, res, next) => {
  const token = req.cookies.auth; // Check for JWT in cookies
  if (!token) {
      // If no token, serve the login page
      return res.sendFile(path.join(__dirname, '../public/login/index.html'));
  }

  try {
      // Verify the token
      jwt.verify(token, process.env.SESSION_SECRET);
      // If verified, proceed to the next middleware or route
      next();
  } catch (err) {
      console.error('Authentication Error:', err);
      // Invalid token, serve the login page
      res.sendFile(path.join(__dirname, '../public/login/index.html'));
  }
};
