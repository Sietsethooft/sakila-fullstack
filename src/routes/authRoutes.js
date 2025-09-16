const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

router.post('/logout', (req, res) => {
    res.clearCookie('token'); // Remove the JWT cookie
    res.redirect('/auth/login'); // Redirect back to login page
});

module.exports = router;