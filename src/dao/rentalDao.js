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
            SELECT film.title, DATE(rental.rental_date) AS hired_on,
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
    }
};
module.exports = rentalDao;