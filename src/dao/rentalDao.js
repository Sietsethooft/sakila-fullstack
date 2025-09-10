const db = require('../models/db');

const rentalDao = {
    getRentalHistoryByCustomerId(customer_id, callback) {
        const query = `
            SELECT rental.rental_id, rental.rental_date, film.title, rental.return_date, amount
            FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            JOIN payment ON payment.rental_id = rental.rental_id
            WHERE rental.customer_id = ?
            ORDER BY rental.rental_date DESC
        `;
        db.query(query, [customer_id], callback);
    },

    getActiveRentalsByCustomerId(customer_id, callback) {
        const query = `
            SELECT film.title, DATE(rental.rental_date) AS hired_on,
            DATE(DATE_ADD(rental.rental_date, INTERVAL film.rental_duration DAY)) AS return_by,
            film.rental_rate AS price
            FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            WHERE rental.customer_id = ?
            AND rental.return_date IS NULL;
        `;
        db.query(query, [customer_id], callback);
    }
};
module.exports = rentalDao;