const db = require('../models/db');

const clientDao = {

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
        db.query(query, params, callback);
    },

    getClientDetails(customer_id, callback) {
        let query = `
        SELECT first_name, last_name, email, active, customer.create_date, customer.last_update, address.address, address.district, city.city, country.country, address.postal_code, address.phone 
        FROM customer
        join address on customer.address_id = address.address_id
        join city on address.city_id = city.city_id
        join country on city.country_id = country.country_id 
        WHERE customer_id = ?;
        `;
        db.query(query, [customer_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    deleteClient(customer_id, callback) {
        const deleteRentalsQuery = 'DELETE FROM rental WHERE customer_id = ?';
        db.query(deleteRentalsQuery, [customer_id], (err) => {
            if (err) return callback(err);
            const deletePaymentsQuery = 'DELETE FROM payment WHERE customer_id = ?';
            db.query(deletePaymentsQuery, [customer_id], (err) => {
                if (err) return callback(err);
                const deleteCustomerQuery = 'DELETE FROM customer WHERE customer_id = ?';
                db.query(deleteCustomerQuery, [customer_id], callback);
            });
        });
    },

    createClient(clientData, callback) {
        const { first_name, last_name, email, address, district, city, country, postal_code, phone } = clientData;
        const storeId = 1; // Temp hardcoded store_id

        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);

            const countrySql = `
                INSERT INTO country (country, last_update)
                VALUES (?, NOW())
                ON DUPLICATE KEY UPDATE country_id = LAST_INSERT_ID(country_id)
            `;
            db.query(countrySql, [country], (err, result) => {
                if (err) return rollback(err);

                const countryId = result.insertId;

                const citySql = `
                    INSERT INTO city (city, country_id, last_update)
                    VALUES (?, ?, NOW())
                    ON DUPLICATE KEY UPDATE city_id = LAST_INSERT_ID(city_id)
                `;
                db.query(citySql, [city, countryId], (err, result) => {
                    if (err) return rollback(err);

                    const cityId = result.insertId;

                    const addressSql = `
                        INSERT INTO address (address, address2, district, city_id, postal_code, phone, last_update, location)
                        VALUES (?, '', ?, ?, ?, ?, NOW(), ST_GeomFromText('POINT(0 0)', 0))
                    `;
                    db.query(addressSql, [address, district, cityId, postal_code, phone], (err, result) => {
                        if (err) return rollback(err);

                        const addressId = result.insertId;

                        const customerSql = `
                            INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date, last_update)
                            VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
                        `;
                        db.query(customerSql, [storeId, first_name, last_name, email, addressId], (err, result) => {
                            if (err) return rollback(err);

                            const customerId = result.insertId;

                            db.query('COMMIT', (err) => {
                                if (err) return rollback(err);

                                callback(null, { customerId, first_name, last_name, email });
                            });
                        });
                    });
                });
            });
        });
    },
    updateClient(clientId, clientData, callback) {
        const { first_name, last_name, email, address, district, city, country, postal_code, phone } = clientData;

        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);

            const countrySql = `
                INSERT INTO country (country, last_update)
                VALUES (?, NOW())
                ON DUPLICATE KEY UPDATE country_id = LAST_INSERT_ID(country_id)
            `;
            db.query(countrySql, [country], (err, result) => {
                if (err) return rollback(err);

                const countryId = result.insertId;

                const citySql = `
                    INSERT INTO city (city, country_id, last_update)
                    VALUES (?, ?, NOW())
                    ON DUPLICATE KEY UPDATE city_id = LAST_INSERT_ID(city_id)
                `;
                db.query(citySql, [city, countryId], (err, result) => {
                    if (err) return rollback(err);

                    const cityId = result.insertId;

                    // First get the address_id of the customer
                    const addressIdSql = `SELECT address_id FROM customer WHERE customer_id = ?`;
                    db.query(addressIdSql, [clientId], (err, rows) => {
                        if (err) return rollback(err);
                        if (rows.length === 0) return rollback(new Error("Customer not found"));

                        const addressId = rows[0].address_id;

                        // Update the address
                        const addressSql = `
                            UPDATE address
                            SET address = ?, district = ?, city_id = ?, postal_code = ?, phone = ?, last_update = NOW()
                            WHERE address_id = ?
                        `;
                        db.query(addressSql, [address, district, cityId, postal_code, phone, addressId], (err) => {
                            if (err) return rollback(err);

                            // Update the customer
                            const customerSql = `
                                UPDATE customer
                                SET first_name = ?, last_name = ?, email = ?, last_update = NOW()
                                WHERE customer_id = ?
                            `;
                            db.query(customerSql, [first_name, last_name, email, clientId], (err) => {
                                if (err) return rollback(err);

                                db.query('COMMIT', (err) => {
                                    if (err) return rollback(err);

                                    callback(null, { clientId, first_name, last_name, email });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
};

function rollback(callback, err) {
    db.query('ROLLBACK', () => {
        callback(err);
    });
}

module.exports = clientDao;