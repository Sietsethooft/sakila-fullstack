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
    },
    getClientDetails(clientId, callback) {
        let query = `
        SELECT first_name, last_name, email, active, customer.create_date, customer.last_update, address.address, address.district, city.city, country.country 
        FROM customer
        join address on customer.address_id = address.address_id
        join city on address.city_id = city.city_id
        join country on city.country_id = country.country_id 
        WHERE customer_id = ?;
        `;
        db.query(query, [clientId], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    deleteClient(clientId, callback) {
        // First delete all rental history records
        const deleteRentalsQuery = 'DELETE FROM rental WHERE customer_id = ?';
        db.query(deleteRentalsQuery, [clientId], (err) => {
            if (err) return callback(err);
            // Then delete all payment records
            const deletePaymentsQuery = 'DELETE FROM payment WHERE customer_id = ?';
            db.query(deletePaymentsQuery, [clientId], (err) => {
                if (err) return callback(err);
                // Then delete the customer
                const deleteCustomerQuery = 'DELETE FROM customer WHERE customer_id = ?';
                db.query(deleteCustomerQuery, [clientId], (err, results) => {
                    if (err) return callback(err);
                    callback(null, results);
                });
            });
        });
    }
};

module.exports = clientService;