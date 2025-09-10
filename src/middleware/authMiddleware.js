const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.cookies.token; // Get token from cookies
    if (!token) {
        return res.redirect('/auth/login');
    }
    jwt.verify(token, 'secretkey', (err, decoded) => {
        if (err) {
            return res.redirect('/auth/login');
        }
        req.user = decoded;
        res.locals.user = decoded;
        next();
    });
};