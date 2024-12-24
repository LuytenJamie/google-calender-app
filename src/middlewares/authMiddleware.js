const jwt = require('jsonwebtoken');
const path = require('path');
const { getEnforcer } = require('./enforcer');
const { getActiveUser } = require('../utils/activeUsers');

exports.authorize = (obj, act) => async (req, res, next) => {
    const token = req.cookies.auth;
  
    if (!token) return res.status(401).send('Not authenticated');
  
    try {
      const { email } = jwt.verify(token, process.env.SESSION_SECRET);
  
      const enforcer = getEnforcer();
  
      if (!enforcer) return res.status(500).send('Enforcer not initialized');
  
      const allowed = await enforcer.enforce(email, obj, act);
  
      if (!allowed) return res.status(403).send('Access denied');
  
      next();
    } catch (error) {
      console.error('Authorization Error:', error);
      res.status(403).send('Access denied');
    }
};

exports.isAuthenticated = (req, res, next) => {
  const token = req.cookies.auth;
  const userEmail = token
    ? jwt.decode(token).email
    : null;

  if (!token || !userEmail || !getActiveUser(userEmail)?.accessToken) {
      return res.sendFile(path.join(__dirname, '../public/login/index.html'));
  }

  try {
      jwt.verify(token, process.env.SESSION_SECRET);
      next();
  } catch (err) {
      console.error('Authentication Error:', err);
      res.sendFile(path.join(__dirname, '../public/login/index.html'));
  }
};
