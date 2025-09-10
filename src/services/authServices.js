const authDao = require('../dao/authDao');

const authService = {
    authenticate(username, callback) {
        authDao.findUser(username, callback);
    }
};

module.exports = authService;