const express = require('express');
const path = require('path');
const authController = require('../controllers/authController');
const milestoneController = require('../controllers/milestoneController');
const calendarController = require('../controllers/calendarController');
const { authorize, isAuthenticated } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard/index.html'));
});
// Authentication routes (no auth required for these)
router.get('/auth/google', authController.googleAuth);
router.get('/auth/google/callback', authController.googleCallback);
router.get('/auth/me', authController.getMe);
router.post('/auth/logout', authController.logout);

// Milestone routes (RBAC protection needed)
router.get('/milestones', authorize('milestones', 'view'), milestoneController.getMilestones);

// Calendar routes (RBAC protection needed)
router.post('/calendar/event', authorize('calendar', 'add'), calendarController.addEvent);

module.exports = router;
