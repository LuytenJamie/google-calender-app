const axios = require('axios');
const jwt = require('jsonwebtoken');
const {getEnforcer} = require('../middlewares/enforcer');
const redirectURI = 'http://localhost:3000/auth/google/callback';
const SCOPES = 'https://www.googleapis.com/auth/calendar openid email profile';

let accessToken = '';
let refreshToken = '';

exports.googleAuth = (req, res) => {
    const googleAuthURL = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectURI,
        response_type: 'code',
        scope: SCOPES,
        access_type: 'offline',  // Get refresh token as well
        prompt: 'consent', //Always ask for permission
    });
    res.redirect(`${googleAuthURL}?${params.toString()}`);
};

exports.googleCallback = async (req, res) => {
    const { code } = req.query;
    const tokenURL = 'https://oauth2.googleapis.com/token';
    const userInfoURL = 'https://openidconnect.googleapis.com/v1/userinfo';

    try {
        // Exchange authorization code for tokens
        const { data: tokenData } = await axios.post(tokenURL, {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectURI,
            grant_type: 'authorization_code',
        });
        //Store access and refresh tokens
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token;

        const { data: userInfo } = await axios.get(userInfoURL, {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const roles =  await getEnforcer().getRolesForUser(userInfo.email);
        if (!roles || roles.length === 0) {
            return res.status(403).send('Role not found in policy');
        }
        console.log(roles);
        const role = roles[0];

        // Generate and set JWT in a cookie
        const jwtToken = jwt.sign(
            { email: userInfo.email, name: userInfo.name, role: role },
            process.env.SESSION_SECRET,
            { expiresIn: '1h' }
        );

        // Save access_token and JWT in cookies
        res.cookie('auth', jwtToken, { httpOnly: true });
        res.cookie('googleAccessToken', tokenData.access_token, { httpOnly: true });

        res.redirect('/');
    } catch (error) {
        console.error('Google Authentication Error:', error.response?.data || error.message);
        res.status(500).send('Authentication failed');
    }
};
exports.getMe = (req, res) => {
    const authToken = req.cookies.auth;

    if (!authToken) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        const decoded = jwt.verify(authToken, process.env.SESSION_SECRET);
        const userInfo = {
            name: decoded.name,
            email: decoded.email,
            role: decoded.role || 'free', // Default role is 'free'
        };
        console.log(userInfo);
        res.json(userInfo);
    } catch (err) {
        console.error('JWT verification error:', err);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.logout = (req, res) => {
    // Clear cookies by setting them to empty values with an expired date
    res.clearCookie('auth');
    res.clearCookie('googleAccessToken');
    res.status(200).json({ message: 'Logged out successfully' });
};
