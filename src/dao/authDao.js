const db = require('../models/db');

const authDao = {
    findUser(username, password, callback) {
        let query = `SELECT * FROM staff WHERE username = ? AND password = ?`;
        db.query(query, [username, password], (err, results) => {
            if (err) {
                return callback(err);
            }
            if (results.length > 0) {
                return callback(null, results[0]);
            }
            callback(null, null);
        });
    }
};

module.exports = authDao;