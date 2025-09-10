const authDao = require('../dao/authDao');

const authService = {
    authenticate(username, password, callback) {
        authDao.findUser(username, password, callback);
    }
};

module.exports = authService;