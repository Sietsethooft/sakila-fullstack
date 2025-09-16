const db = require('../models/db');

const staffDao = {
    getStoreIdByStaffId(staff_id, callback) {
        let query = `SELECT store_id FROM staff WHERE staff_id = ?`;
        db.getConnection((err, connection) => {
            if (err) {
                return callback(err);
            }
            connection.query(query, [staff_id], (error, results) => {
                connection.release();
                if (error) {
                    return callback(error);
                }
                callback(null, results[0] ? results[0].store_id : null);
            });
        });
    }
};

module.exports = staffDao;