const authService = require('../services/authServices');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

const authController = {
    showLoginForm (req, res) {
        res.render('pages/login', { showFooter: false, error: null }); // Render login page without footer
    },

    login (req, res) {
        const { username, password } = req.body;
        logger.debug(`Attempting login for user: ${username}`);
        authService.authenticate(username, password, (err, user) => {
            if (err || !user) {
                logger.warn(`Login failed for user: ${username} - ${err ? err.message : 'Invalid credentials'}`);
                return res.render('pages/login', {
                    showFooter: false,
                    error: 'Gebruikersnaam of wachtwoord is onjuist.'
                });
            }
            const token = jwt.sign({ id: user.id, username: user.username }, 'secretkey');
            res.cookie('token', token, { httpOnly: true }); // Set token in cookie
            res.redirect('/dashboard');
        });
    }
};

module.exports = authController;