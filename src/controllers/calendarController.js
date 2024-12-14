const axios = require("axios");

exports.addEvent = async (req, res) => {
    const { summary, start, end } = req.body;
    const accessToken = req.cookies.googleAccessToken;

    if (!accessToken) {
        return res.status(401).json({ error: "Not authenticated with Google" });
    }

    try {
        const event = {
            summary,
            start: { dateTime: new Date(start).toISOString() },
            end: { dateTime: new Date(end).toISOString() },
        };
        // Make a POST request to Google Calendar API
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

        res.status(200).json(response.data); // Return the event data
    } catch (err) {
        console.error("Google Calendar API error:", err.response?.data || err);
        res.status(500).json({ error: "Failed to create calendar event" });
    }
};
