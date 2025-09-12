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
                c.category_id,
                f.length, 
                f.rental_rate, 
                f.rental_duration,
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
                f.rating, f.special_features, f.last_update, c.category_id, f.rental_duration;
        `;

        db.query(query, [film_id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },
    createMovie(movieData, callback) {
        const { 
            title, description, release_year, language_name, 
            category_id, rating, rental_duration, rental_rate, 
            length, inventory 
        } = movieData;

        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);

            // 1. Check if language exists
            const selectLangSql = `SELECT language_id FROM language WHERE name = ? LIMIT 1`;
            db.query(selectLangSql, [language_name], (err, results) => {
                if (err) return rollback(callback, err);

                const insertLanguageIfNeeded = (cb) => {
                    if (results.length > 0) {
                        // language bestaat al
                        return cb(null, results[0].language_id);
                    } else {
                        // language bestaat niet → nieuwe invoegen
                        const insertLangSql = `INSERT INTO language (name) VALUES (?)`;
                        db.query(insertLangSql, [language_name], (err, result) => {
                            if (err) return rollback(callback, err);
                            return cb(null, result.insertId);
                        });
                    }
                };

                insertLanguageIfNeeded((err, languageId) => {
                    if (err) return rollback(callback, err);

                    // 2. Insert film
                    const filmSql = `
                        INSERT INTO film 
                            (title, description, release_year, language_id, 
                            rental_duration, rental_rate, length, rating, replacement_cost, last_update)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
                    `;
                    db.query(filmSql, [
                        title, description || null, release_year || null, languageId,
                        rental_duration, rental_rate, length || null, rating, 19.99
                    ], (err, result) => {
                        if (err) return rollback(callback, err);

                        const film_id = result.insertId;

                        // 3. Link film to category
                        const filmCategorySql = `
                            INSERT INTO film_category (film_id, category_id, last_update)
                            VALUES (?, ?, NOW())
                        `;
                        db.query(filmCategorySql, [film_id, category_id], (err) => {
                            if (err) return rollback(callback, err);

                            // 4. Insert inventory copies
                            const storeId = 1; // hardcoded
                            const values = Array.from({ length: inventory }, () => [film_id, storeId, new Date()]);

                            const inventorySql = `
                                INSERT INTO inventory (film_id, store_id, last_update)
                                VALUES ?
                            `;
                            db.query(inventorySql, [values], (err) => {
                                if (err) return rollback(callback, err);

                                db.query('COMMIT', (err) => {
                                    if (err) return rollback(callback, err);

                                    callback(null, { film_id, title, inventory });
                                });
                            });
                        });
                    });
                });
            });
        });

    },
    deleteMovie(film_id, callback) {
        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);

            // 1. Delete payments related to rentals of the film
            const deletePaymentsSql = `
                DELETE p
                FROM payment p
                JOIN rental r ON p.rental_id = r.rental_id
                JOIN inventory i ON r.inventory_id = i.inventory_id
                WHERE i.film_id = ?
            `;
            db.query(deletePaymentsSql, [film_id], (err) => {
                if (err) return rollback(callback, err);

                // 2. Delete rentals related to the film
                const deleteRentalsSql = `
                    DELETE r
                    FROM rental r
                    JOIN inventory i ON r.inventory_id = i.inventory_id
                    WHERE i.film_id = ?
                `;
                db.query(deleteRentalsSql, [film_id], (err) => {
                    if (err) return rollback(callback, err);

                    // 3. Delete inventory related to the film
                    const deleteInventorySql = `
                        DELETE FROM inventory
                        WHERE film_id = ?
                    `;
                    db.query(deleteInventorySql, [film_id], (err) => {
                        if (err) return rollback(callback, err);

                        // 4. Delete film_category relationships
                        const deleteFilmCategorySql = `
                            DELETE FROM film_category
                            WHERE film_id = ?
                        `;
                        db.query(deleteFilmCategorySql, [film_id], (err) => {
                            if (err) return rollback(callback, err);

                            // 5. Delete the film itself
                            const deleteFilmSql = `
                                DELETE FROM film
                                WHERE film_id = ?
                            `;
                            db.query(deleteFilmSql, [film_id], (err) => {
                                if (err) return rollback(callback, err);

                                // Commit transaction
                                db.query('COMMIT', (err) => {
                                    if (err) return rollback(callback, err);

                                    callback(null, { success: true, deletedFilmId: film_id });
                                });
                            });
                        });
                    });
                });
            });
        });
    },
    updateMovie(film_id, movieData, callback) {
        const {
            title,
            description,
            release_year,
            language_name,
            category_id,
            rating,
            rental_duration,
            rental_rate,
            length,
            inventory
        } = movieData;

        db.query('START TRANSACTION', (err) => {
            if (err) return callback(err);

            // 1. Check if language exists
            const selectLangSql = `SELECT language_id FROM language WHERE name = ? LIMIT 1`;
            db.query(selectLangSql, [language_name], (err, results) => {
                if (err) return rollback(callback, err);

                const insertLanguageIfNeeded = (cb) => {
                    if (results.length > 0) {
                        // Language already exists
                        return cb(null, results[0].language_id);
                    } else {
                        // Insert new language
                        const insertLangSql = `INSERT INTO language (name) VALUES (?)`;
                        db.query(insertLangSql, [language_name], (err, result) => {
                            if (err) return rollback(callback, err);
                            return cb(null, result.insertId);
                        });
                    }
                };

                insertLanguageIfNeeded((err, languageId) => {
                    if (err) return rollback(callback, err);

                    // 2. Update film details
                    const filmSql = `
                        UPDATE film
                        SET title = ?,
                            description = ?,
                            release_year = ?,
                            language_id = ?,
                            rental_duration = ?,
                            rental_rate = ?,
                            length = ?,
                            rating = ?,
                            last_update = NOW()
                        WHERE film_id = ?
                    `;
                    db.query(filmSql, [
                        title,
                        description || null,
                        release_year || null,
                        languageId,
                        rental_duration,
                        rental_rate,
                        length || null,
                        rating,
                        film_id
                    ], (err) => {
                        if (err) return rollback(callback, err);

                        // 3. Update film category
                        const categorySql = `
                            UPDATE film_category
                            SET category_id = ?, last_update = NOW()
                            WHERE film_id = ?
                        `;
                        db.query(categorySql, [category_id, film_id], (err) => {
                            if (err) return rollback(callback, err);

                            // 4. Count current inventory
                            const countInventorySql = `
                                SELECT COUNT(*) AS count
                                FROM inventory
                                WHERE film_id = ?
                            `;
                            db.query(countInventorySql, [film_id], (err, rows) => {
                                if (err) return rollback(callback, err);

                                const currentCount = rows[0].count;

                                if (inventory > currentCount) {
                                    // Add new copies
                                    const addCount = inventory - currentCount;
                                    const storeId = 1;
                                    const values = Array.from({ length: addCount }, () => [film_id, storeId, new Date()]);

                                    const insertInventorySql = `
                                        INSERT INTO inventory (film_id, store_id, last_update)
                                        VALUES ?
                                    `;
                                    db.query(insertInventorySql, [values], (err) => {
                                        if (err) return rollback(callback, err);
                                        commitSuccess();
                                    });
                                } else if (inventory < currentCount) {
                                    // Remove excess copies
                                    const removeCount = currentCount - inventory;

                                    const deleteInventorySql = `
                                        DELETE FROM inventory
                                        WHERE film_id = ?
                                        ORDER BY inventory_id DESC
                                        LIMIT ?
                                    `;
                                    db.query(deleteInventorySql, [film_id, removeCount], (err) => {
                                        if (err) return rollback(callback, err);
                                        commitSuccess();
                                    });
                                } else {
                                    // No inventory changes
                                    commitSuccess();
                                }
                            });
                        });
                    });
                });
            });
        });

        function commitSuccess() {
            db.query('COMMIT', (err) => {
                if (err) return rollback(callback, err);
                callback(null, { success: true, updatedFilmId: film_id });
            });
        }
    }

}


function rollback(callback, err) {
    db.query('ROLLBACK', () => {
        callback(err);
    });
}

module.exports = movieDao;