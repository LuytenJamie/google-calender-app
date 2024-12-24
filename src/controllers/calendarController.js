const axios = require("axios");
const jwt = require("jsonwebtoken");
const { getActiveUser } = require("../utils/activeUsers");

exports.addEvent = async (req, res) => {
    const { summary, start, end } = req.body;
    const userEmail = req.cookies.auth
    ? jwt.decode(req.cookies.auth).email
    : null;

    const accessToken = getActiveUser(userEmail).accessToken;

    if (!accessToken) {
        return res.status(401).json({ error: "Not authenticated with Google" });
    }

    try {
        const event = {
            summary,
            start: { dateTime: new Date(start).toISOString() },
            end: { dateTime: new Date(end).toISOString() },
        };

        const response = await axios.post(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            event,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json(response.data);
    } catch (err) {
        console.error("Google Calendar API error:", err.response?.data || err);
        res.status(500).json({ error: "Failed to create calendar event" });
    }
};
