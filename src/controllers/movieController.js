const movieService = require('../services/movieServices');
const logger = require('../utils/logger');

const movieController = {
    getAllMovies (req, res) {
        movieService.getMovies((error, movies) => {
            if (error) {
                logger.error(`Error retrieving movies: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Fout bij het ophalen van films',
                    error: { status: 500, stack: error.stack }
                });
            }
            logger.debug(`Movies retrieved successfully: ${movies.length} found`);
            res.render('pages/movieManagement/movieIndex', { movies });
        });
    }
};

module.exports = movieController;