const db = require('../models/db');

const rentalService = {
    getRentalHistoryByClientId(clientId, callback) {
        const query = `
            SELECT rental.rental_id, rental.rental_date, film.title, rental.return_date, amount
            FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            JOIN payment ON payment.rental_id = rental.rental_id
            WHERE rental.customer_id = ?
            ORDER BY rental.rental_date DESC
        `;
        db.query(query, [clientId], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    },
    getActiveRentalsByClientId(clientId, callback) {
        const query = `
            SELECT film.title, DATE(rental.rental_date) AS Verhuurd_op,
            DATE(DATE_ADD(rental.rental_date, INTERVAL film.rental_duration DAY)) AS Te_retourneren_voor,
            film.rental_rate AS Prijs
            FROM rental
            JOIN inventory ON rental.inventory_id = inventory.inventory_id
            JOIN film ON inventory.film_id = film.film_id
            WHERE rental.customer_id = ?
            AND rental.return_date IS NULL;
        `;
        db.query(query, [clientId], (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    }
};

module.exports = rentalService;