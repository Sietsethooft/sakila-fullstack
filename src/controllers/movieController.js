const movieService = require('../services/movieServices');
const languageService = require('../services/languageServices');
const categoryService = require('../services/categoryServices');
const ratingService = require('../services/ratingServices');
const logger = require('../utils/logger');
const formatDate = require('../utils/formatDate');

const movieController = {
    getAllMovies (req, res) {
        const { search, language, category, rating } = req.query;

        movieService.getMovies({ search, language, category, rating }, (error, movies) => {
            if (error) {
                logger.error(`Error retrieving movies: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Fout bij het ophalen van films',
                    error: { status: 500, stack: error.stack }
                });
            }
            languageService.getLanguages((langError, languages) => {
                if (langError) {
                    logger.error(`Error retrieving languages: ${langError.message}`);
                    return res.status(500).render('pages/error', {
                        message: 'Fout bij het ophalen van talen',
                        error: { status: 500, stack: langError.stack }
                    });
                }
                categoryService.getCategories((catError, categories) => {
                    if (catError) {
                        logger.error(`Error retrieving categories: ${catError.message}`);
                        return res.status(500).render('pages/error', {
                            message: 'Fout bij het ophalen van categorieën',
                            error: { status: 500, stack: catError.stack }
                        });
                    }
                    ratingService.getRatings((ratError, ratings) => {
                        if (ratError) {
                            logger.error(`Error retrieving ratings: ${ratError.message}`);
                            return res.status(500).render('pages/error', {
                                message: 'Fout bij het ophalen van ratings',
                                error: { status: 500, stack: ratError.stack }
                            });
                    }
                    logger.debug(`ratings found: ${ratings.map(r => r.rating).join(', ')}`);
                    logger.debug(`Movies retrieved successfully: ${movies.length} found`);
                    res.render('pages/movieManagement/movieIndex', { movies, languages, categories, ratings });
                    });
                });
            });
        });
    },
    getMovieById (req, res) {
        const film_id = req.params.id;
        movieService.getMovieById(film_id, (error, movie) => {
            if (error) {
                logger.error(`Error retrieving movie: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Fout bij het ophalen van film',
                    error: { status: 500, stack: error.stack }
                });
            }
            else if (!movie) {
                logger.warn(`Movie not found: ID ${film_id}`);
                res.status(404).render('pages/error', {
                    message: 'Film niet gevonden',
                    error: { status: 404, stack: '' }
                });
            }
            if (movie && movie.last_update) {
                movie.last_update = formatDate(movie.last_update);
            }
            res.render('pages/movieManagement/movieDetail', { movie });
        });
    }
};

module.exports = movieController;