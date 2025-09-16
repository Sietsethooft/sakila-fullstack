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
    },
    deleteMovie(film_id, callback) {
        movieDao.deleteMovie(film_id, callback);
    },
    updateMovie(film_id, movieData, callback) {
        movieDao.updateMovie(film_id, movieData, callback);
    },
    getMovieAvailabilities(callback) {
        movieDao.getMovieAvailabilities(callback);
    },
    getInventoryByFilmId(film_id, callback) {
        movieDao.getInventoryByFilmId(film_id, callback);
    },
    getTopMovies(callback) {
        movieDao.getTopMovies(callback);
    }
};

module.exports = movieService;  