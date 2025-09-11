const movieDao = require('../dao/movieDao');

const movieService = {
    getMovies(filters, callback) {
        movieDao.getMovies(filters, callback);
    },
    getMovieById(film_id, callback) {
        movieDao.getMovieById(film_id, callback);
    }
};

module.exports = movieService;  