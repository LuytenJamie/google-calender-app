const express = require("express");
const path = require("path");
const authController = require("../controllers/authController");
const milestoneController = require("../controllers/milestoneController");
const calendarController = require("../controllers/calendarController");
const { authorize, isAuthenticated } = require("../middlewares/authMiddleware");
const { getActiveUser } = require("../utils/activeUsers");

const router = express.Router();

router.get("/", isAuthenticated, (_, res) => {
    res.sendFile(path.join(__dirname, "../public/dashboard/index.html"));
});

router.get("/auth/google", authController.googleAuth);
router.get("/auth/google/callback", authController.googleCallback);
router.get("/auth/github", authController.githubAuth);
router.get("/auth/github/check", authController.githubAuthCheck);
router.get("/auth/github/callback", authController.githubCallback);
router.get("/auth/me", authController.getMe);
router.post("/auth/logout", authController.logout);

router.get(
    "/milestones",
    authorize("milestones", "view"),
    milestoneController.getMilestones
);

router.post(
    "/calendar/event",
    authorize("calendar", "add"),
    calendarController.addEvent
);

module.exports = router;
