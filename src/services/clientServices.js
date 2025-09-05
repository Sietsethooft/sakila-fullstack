const db = require('../models/db');

clientService = {
    getClients(callback) {
        const query = `
            SELECT 
                customer_id,
                first_name,
                last_name,
                email,
                active,
                last_update
            FROM customer
        `;
        db.query(query, (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    }

};

module.exports = clientService;