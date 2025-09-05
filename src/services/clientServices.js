const db = require('../models/db');

const clientService = {
    getClients(search, callback) {
        let query = `
            SELECT customer_id, first_name, last_name, email, active, last_update
            FROM customer
        `;
        let params = [];
        if (search) {
            query += ' WHERE CONCAT(first_name, " ", last_name) LIKE ?';
            params.push(`%${search}%`);
        }
        db.query(query, params, (err, results) => {
            if (err) return callback(err);
            callback(null, results);
        });
    }
};

module.exports = clientService;