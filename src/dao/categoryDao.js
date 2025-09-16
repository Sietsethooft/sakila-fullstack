const db = require('../models/db');

const categoryDao = {
    getCategories(callback) {
        db.query('SELECT * FROM category', (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    }
};

module.exports = categoryDao;