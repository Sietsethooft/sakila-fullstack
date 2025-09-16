const db = require('../models/db');

const rentalDao = {
    getRentalHistoryByCustomerId(customer_id, callback) {
        let query = `
            SELECT rental.rental_id, rental.rental_date, film.title, rental.return_date, amount
            FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            JOIN payment ON payment.rental_id = rental.rental_id
            WHERE rental.customer_id = ? AND rental.return_date IS NOT NULL
            ORDER BY rental.rental_date DESC
        `;
        db.query(query, [customer_id], callback);
    },

    getActiveRentalsByCustomerId(customer_id, callback) {
        let query = `
            SELECT rental.rental_id, film.title, DATE(rental.rental_date) AS hired_on,
            DATE(DATE_ADD(rental.rental_date, INTERVAL film.rental_duration DAY)) AS return_by,
            payment.amount AS price
            FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            JOIN payment ON payment.rental_id = rental.rental_id
            WHERE rental.customer_id = ?
            AND rental.return_date IS NULL;
        `;
        db.query(query, [customer_id], callback);
    },

    getRentalHistoryByFilmId(film_id, callback) {
        let query = `
            select CONCAT(c.first_name, ' ', c.last_name) AS customer_name, r.rental_date, r.return_date, p.amount
            from film f
            join inventory i on f.film_id = i.film_id 
            join rental r on r.inventory_id = i.inventory_id 
            join customer c on c.customer_id = r.customer_id 
            join payment p on p.rental_id = r.rental_id
            where f.film_id = ? AND r.return_date IS NOT NULL
            order by r.rental_date DESC;
        `;
        db.query(query, [film_id], callback);
    },

    getActiveRentalsByFilmId(film_id, callback) {
        let query = `
            SELECT CONCAT(c.first_name, ' ', c.last_name) AS customer_name, r.rental_date, 
            DATE(DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY)) AS return_by, p.amount
            FROM film f
            JOIN inventory i ON f.film_id = i.film_id
            JOIN rental r ON r.inventory_id = i.inventory_id
            JOIN customer c ON c.customer_id = r.customer_id
            JOIN payment p ON p.rental_id = r.rental_id
            WHERE f.film_id = ? AND r.return_date IS NULL;
        `;
        db.query(query, [film_id], callback);
    },

    getAllOpenRentals(callback) {
        const query = `
            SELECT
                r.rental_id, 
                CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
                f.title,
                r.rental_date,
                DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY) AS return_by,
                p.amount
            FROM rental r
            JOIN customer c ON r.customer_id = c.customer_id
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN film f ON i.film_id = f.film_id
            JOIN payment p ON p.rental_id = r.rental_id
            WHERE r.return_date IS NULL
            AND NOW() <= DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY)
            ORDER BY r.rental_date DESC
        `;
        db.query(query, callback);
    },

    getAllOverdueRentals(callback) {
        const query = `
            SELECT 
                r.rental_id,
                CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
                f.title,
                r.rental_date,
                DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY) AS due_date,
                ROUND(f.rental_rate, 2) AS expected_amount,
                ROUND(
                    LEAST(
                        DATEDIFF(NOW(), DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY)) * 0.10,
                        f.replacement_cost * 1.5
                    ), 2
                ) AS fine_amount
            FROM rental r
            JOIN customer c ON r.customer_id = c.customer_id
            JOIN inventory i ON r.inventory_id = i.inventory_id
            JOIN film f ON i.film_id = f.film_id
            WHERE r.return_date IS NULL
            AND NOW() > DATE_ADD(r.rental_date, INTERVAL f.rental_duration DAY)
            ORDER BY r.rental_date DESC;
        `;
        db.query(query, callback);
    },

    createRental(rentalData, callback) {
        const { inventory_id, customer_id, staff_id } = rentalData;

        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);

            // 1. Insert rental
            const rentalSql = `
                INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id, last_update)
                VALUES (NOW(), ?, ?, ?, NOW())
            `;
            db.query(rentalSql, [inventory_id, customer_id, staff_id], (err, result) => {
                if (err) return rollback(callback, err);

                const rental_id = result.insertId;

                // 2. Get rental_rate from the film linked to this inventory
                const rateSql = `
                    SELECT f.rental_rate
                    FROM inventory i
                    JOIN film f ON i.film_id = f.film_id
                    WHERE i.inventory_id = ?
                    LIMIT 1
                `;
                db.query(rateSql, [inventory_id], (err, results) => {
                    if (err) return rollback(callback, err);
                    if (results.length === 0) return rollback(callback, new Error('Inventory not found'));

                    const amount = results[0].rental_rate;

                    // 3. Insert payment
                    const paymentSql = `
                        INSERT INTO payment (customer_id, staff_id, rental_id, amount, payment_date)
                        VALUES (?, ?, ?, ?, NOW())
                    `;
                    db.query(paymentSql, [customer_id, staff_id, rental_id, amount], (err) => {
                        if (err) return rollback(callback, err);

                        db.query('COMMIT', (err) => {
                            if (err) return rollback(callback, err);

                            callback(null, { rental_id, amount });
                        });
                    });
                });
            });
        });
    },
    closeRental(rentalId, callback) {
        let query = `
            UPDATE rental
            SET return_date = NOW()
            WHERE rental_id = ?
            AND return_date IS NULL;
        `;
        db.query(query, [rentalId], (err) => {
            if (err) return callback(err);
            callback(null);
        });
    }
};

function rollback(callback, err) {
    db.query('ROLLBACK', () => {
        callback(err);
    });
}

module.exports = rentalDao;