const movieDao = require('../dao/movieDao');

const movieService = {
    getMovies(filters, callback) {
        movieDao.getMovies(filters, callback);
    }
};

module.exports = movieService;