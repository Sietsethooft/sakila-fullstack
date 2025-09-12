const { createMovie } = require('../controllers/movieController');
const movieDao = require('../dao/movieDao');

const movieService = {
    getMovies(filters, callback) {
        movieDao.getMovies(filters, callback);
    },
    getMovieById(film_id, callback) {
        movieDao.getMovieById(film_id, callback);
    },
    createMovie(movieData, callback) {
        movieDao.createMovie(movieData, callback);
    }
};

module.exports = movieService;  