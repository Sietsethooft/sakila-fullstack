const movieDao = require('../dao/movieDao');

const movieService = {
    getMovies(callback) {
        movieDao.getMovies(callback);
    }
};

module.exports = movieService;