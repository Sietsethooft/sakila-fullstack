const authService = require('../services/authServices');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const authController = {
    showLoginForm (req, res) {
        res.render('pages/login', { showFooter: false, error: null }); // Render login page without footer
    },

    login (req, res) {
        const { username, password } = req.body;
        logger.debug(`Attempting login for user: ${username}`);
        authService.authenticate(username, (err, user) => {
            if (err || !user) {
                logger.warn(`Login failed for user: ${username} - ${err ? err.message : 'Invalid credentials'}`);
                return res.render('pages/login', {
                    showFooter: false,
                    error: 'Gebruikersnaam of wachtwoord is onjuist.'
                });
            }

            // bcrypt password check
            bcrypt.compare(password, user.password, (bcryptErr, isMatch) => {
                if (bcryptErr || !isMatch) {
                    logger.warn(`Login failed for user: ${username} - Invalid password`);
                    return res.render('pages/login', {
                        showFooter: false,
                        error: 'Gebruikersnaam of wachtwoord is onjuist.'
                    });
                }

                const userFullName = user.first_name + ' ' + user.last_name;
                logger.debug(`userid: ${user.staff_id}, userFullName: ${userFullName}`);
                const token = jwt.sign({ id: user.staff_id, userFullName: userFullName }, 'secretkey');
                res.cookie('token', token, { httpOnly: true }); // Set token in cookie
                res.redirect('/dashboard');
            });
        });
    }
}


module.exports = authController;