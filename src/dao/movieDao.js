const db = require('../models/db');

const movieDao = {
    getMovies({ search, language, category }, callback) {
        let query = `
            SELECT f.film_id, f.title, f.description, f.release_year, f.rating, l.name as language_name, c.name as category_name 
            FROM film f
            JOIN language l ON l.language_id = f.language_id
            JOIN film_category fc ON fc.film_id = f.film_id 
            JOIN category c ON fc.category_id = c.category_id
            WHERE 1=1
        `;
        const params = [];

        if (search) {
            query += ' AND f.title LIKE ?';
            params.push('%' + search + '%');
        }
        if (language) {
            query += ' AND l.name = ?';
            params.push(language);
        }
        if (category) {
            query += ' AND c.name = ?';
            params.push(category);
        }

        db.query(query, params, (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    }
};

module.exports = movieDao;