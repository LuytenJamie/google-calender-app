const axios = require("axios");
const jwt = require("jsonwebtoken");
const { getEnforcer } = require("../middlewares/enforcer");
const redirectURI = "http://localhost:3000/auth/google/callback";
const SCOPES = "https://www.googleapis.com/auth/calendar openid email profile";
const { setActiveUser, getActiveUser, deleteActiveUser } = require("../utils/activeUsers");

exports.googleAuth = (req, res) => {
  const googleAuthURL = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: redirectURI,
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
  });
  res.redirect(`${googleAuthURL}?${params.toString()}`);
};

exports.googleCallback = async (req, res) => {
  const { code } = req.query;
  const tokenURL = "https://oauth2.googleapis.com/token";
  const userInfoURL = "https://openidconnect.googleapis.com/v1/userinfo";

  try {
    const { data: tokenData } = await axios.post(tokenURL, {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectURI,
      grant_type: "authorization_code",
    });

    const { data: userInfo } = await axios.get(userInfoURL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!getActiveUser(userInfo.email)) setActiveUser([userInfo.email], {});

    //Store access and refresh tokens
    setActiveUser(`${userInfo.email}`, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      ...getActiveUser(userInfo.email),
    });

    const roles = await getEnforcer().getRolesForUser(userInfo.email);
    if (!roles || roles.length === 0) {
      return res.status(403).send("Role not found in policy");
    }

    const role = roles[0];

    const jwtToken = jwt.sign(
      { email: userInfo.email, name: userInfo.name, role: role },
      process.env.SESSION_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("auth", jwtToken, { httpOnly: true });

    res.redirect("/");
  } catch (error) {
    console.error(
      "Google Authentication Error:",
      error.response?.data || error.message
    );
    res.status(500).send("Authentication failed");
  }
};

exports.githubAuth = (req, res) => {
  const authToken = req.cookies.auth;

  if (!authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize`;
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    scope: "repo",
  });
  res.redirect(`${githubAuthUrl}?${params.toString()}`);
};

exports.githubCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(403).send("Authorization code missing");
  }

  try {
    const { data: tokenData } = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const userEmail = req.cookies.auth
      ? jwt.decode(req.cookies.auth).email
      : null;

    if (!userEmail)
      throw new Error("User is not authenticated. Please log in first.");

    if (!getActiveUser(userEmail)) setActiveUser(userEmail, {});

    const accessToken = tokenData.access_token;
    setActiveUser(userEmail, {
      githubAccessToken: accessToken,
      ...getActiveUser(userEmail),
    });

    res.redirect("/");
  } catch (error) {
    console.error(
      "Github Authentication Error:",
      error.response?.data || error.message
    );
    res.status(500).send("Authentication failed");
  }
};

exports.githubAuthCheck = (req, res) => {
  const authToken = req.cookies.auth;

  if (!authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
  }

  const userEmail = req.cookies.auth
  ? jwt.decode(req.cookies.auth).email
  : null;

  if (!authToken || !userEmail || !getActiveUser(userEmail)?.githubAccessToken)
    return res.status(401).json({ error: "Not authenticated with GitHub" });

  res.status(200).send("Authenticated");
};

exports.getMe = (req, res) => {
  const authToken = req.cookies.auth;

  if (!authToken) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(authToken, process.env.SESSION_SECRET);
    const userInfo = {
      name: decoded.name,
      email: decoded.email,
      role: decoded.role || "free",
    };

    res.json(userInfo);
  } catch (err) {
    console.error("JWT verification error:", err);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

exports.logout = (req, res) => {
  const userEmail = req.cookies.auth
  ? jwt.decode(req.cookies.auth).email
  : null;
  if(userEmail) deleteActiveUser(userEmail)

  res.clearCookie("auth");
  res.status(200).json({ message: "Logged out successfully" });
};
