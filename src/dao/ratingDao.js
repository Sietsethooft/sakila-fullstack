const db = require('../models/db');

const ratingDao = {
    getRatings(callback) {
        db.query('SELECT rating FROM film GROUP BY rating', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }
};

module.exports = ratingDao;