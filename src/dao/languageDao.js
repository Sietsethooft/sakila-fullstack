const db = require('../models/db');

const languageDao = {
    getLanguages(callback) {
        db.query('SELECT * FROM language', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }
};

module.exports = languageDao;