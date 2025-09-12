const db = require('../models/db');

const movieDao = {
    getMovies({ search, language, category, rating }, callback) {
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
        if (rating) {
            query += ' AND f.rating = ?';
            params.push(rating);
        }

        db.query(query, params, (error, results) => {
            if (error) return callback(error);
            callback(null, results);
        });
    },
    getMovieById(film_id, callback) {
        let query = `
            SELECT 
                COUNT(*) AS total_inventory,
                SUM(CASE WHEN r.rental_id IS NULL OR r.return_date IS NOT NULL THEN 1 ELSE 0 END) AS total_available,
                f.film_id, 
                f.title, 
                f.description, 
                f.release_year, 
                l.name AS language_name, 
                c.name AS category_name, 
                f.length, 
                f.rental_rate, 
                f.rating,  
                f.last_update
            FROM film f
            JOIN language l ON l.language_id = f.language_id
            JOIN film_category fc ON fc.film_id = f.film_id 
            JOIN category c ON fc.category_id = c.category_id
            JOIN inventory i ON f.film_id = i.film_id
            LEFT JOIN rental r 
                ON i.inventory_id = r.inventory_id 
                AND r.return_date IS NULL   -- enkel openstaande rentals
            WHERE f.film_id = ?
            GROUP BY 
                f.film_id, f.title, f.description, f.release_year, 
                l.name, c.name, f.length, f.rental_rate, 
                f.rating, f.special_features, f.last_update;
        `;

        db.query(query, [film_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    createMovie(movieData, callback) {
        const { title, description, release_year, language_name, category_id, rating, rental_duration, rental_rate, length, inventory } = movieData;

        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);

            // 1. Language insert or get existing
            const languageSql = `
                INSERT INTO language (name)
                VALUES (?)
                ON DUPLICATE KEY UPDATE language_id = LAST_INSERT_ID(language_id)
            `;
            db.query(languageSql, [language_name], (err, result) => {
                if (err) return rollback(callback, err);

                const languageId = result.insertId;

                // 2. Add film
                const filmSql = `
                    INSERT INTO film 
                        (title, description, release_year, language_id, 
                        rental_duration, rental_rate, length, rating, replacement_cost, last_update)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                `;
                db.query(filmSql, [
                    title, description || null, release_year || null, languageId,rental_duration, rental_rate, length || null, rating, 19.99 // replacement_cost
                ], (err, result) => {
                    if (err) return rollback(callback, err);

                    const filmId = result.insertId;

                    // 3. Link film to category
                    const filmCategorySql = `
                        INSERT INTO film_category (film_id, category_id, last_update)
                        VALUES (?, ?, NOW())
                    `;
                    db.query(filmCategorySql, [filmId, category_id], (err) => {
                        if (err) return rollback(callback, err);

                        // 4. Create inventory records
                        const storeId = 1; // TEMP hardcoded store_id
                        const values = Array.from({ length: inventory }, () => [filmId, storeId, new Date()]);

                        const inventorySql = `
                            INSERT INTO inventory (film_id, store_id, last_update)
                            VALUES ?
                        `;
                        db.query(inventorySql, [values], (err) => {
                            if (err) return rollback(callback, err);

                            db.query('COMMIT', (err) => {
                                if (err) return rollback(callback, err);

                                callback(null, { filmId, title, inventory });
                            });
                        });
                    });
                });
            });
        });

        function rollback(callback, err) {
            db.query('ROLLBACK', () => {
                callback(err);
            });
        }
    },

};

function rollback(callback, err) {
    db.query('ROLLBACK', () => {
        callback(err);
    });
}

module.exports = movieDao;