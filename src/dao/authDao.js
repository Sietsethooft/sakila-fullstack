const db = require('../models/db');

const authDao = {
    findUser(username, callback) {
        let query = `SELECT * FROM staff WHERE username = ?`;
        db.query(query, [username], (err, results) => {
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