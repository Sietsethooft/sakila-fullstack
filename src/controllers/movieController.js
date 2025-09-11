const movieService = require('../services/movieServices');
const languageService = require('../services/languageServices');
const categoryService = require('../services/categoryServices');
const logger = require('../utils/logger');

const movieController = {
    getAllMovies (req, res) {
        const { search, language, category } = req.query;

        movieService.getMovies({ search, language, category }, (error, movies) => {
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
                    logger.debug(`Movies retrieved successfully: ${movies.length} found`);
                    res.render('pages/movieManagement/movieIndex', { movies, languages, categories });
                });
            });
        });
    }
};

module.exports = movieController;