const db = require('../models/db');

const movieDao = {
    getMovies(callback) {
        const query = `
            SELECT f.title, f.description, f.release_year, f.rating, l.name as language_name, c.name as category_name 
            FROM film f
            join language l on l.language_id = f.language_id
            join film_category fc on fc.film_id = f.film_id 
            join category c on fc.category_id = c.category_id;`;
        db.query(query, (error, results) => {
            if (error) {
                return callback(error);
            }
            callback(null, results);
        });
    }
};

module.exports = movieDao;