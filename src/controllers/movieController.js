const movieService = require('../services/movieServices');
const languageService = require('../services/languageServices');
const categoryService = require('../services/categoryServices');
const ratingService = require('../services/ratingServices');
const rentalService = require('../services/rentalServices');
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
            rentalService.getRentalHistoryByFilmId(film_id, (rentalError, rentalHistory) => {
                rentalService.getActiveRentalsByFilmId(film_id, (activeError, activeRentals) => {
                    if (rentalError) {
                        logger.error(`Error retrieving rental history: ${rentalError.message}`);
                        return res.status(500).render('pages/error', {
                            message: 'Fout bij het ophalen van verhuurgeschiedenis',
                            error: { status: 500, stack: rentalError.stack }
                        });
                    }
                    if (activeError) {
                        logger.error(`Error retrieving active rentals: ${activeError.message}`);
                        return res.status(500).render('pages/error', {
                            message: 'Fout bij het ophalen van actieve verhuur',
                            error: { status: 500, stack: activeError.stack }
                        });
                    }

                    // Format dates in rental history and active rentals
                    if (Array.isArray(rentalHistory)) {
                        rentalHistory.forEach(rental => {
                            if (rental.rental_date) rental.rental_date = formatDate(rental.rental_date);
                            if (rental.return_date) rental.return_date = formatDate(rental.return_date);
                        });
                    }
                    if (Array.isArray(activeRentals)) {
                        activeRentals.forEach(rental => {
                            if (rental.rental_date) rental.rental_date = formatDate(rental.rental_date);
                            if (rental.return_by) rental.return_by = formatDate(rental.return_by);
                        });
                    }
                    res.render('pages/movieManagement/movieDetail', { movie, rentalHistory, activeRentals });
                });
            });
        });
    },
    renderCreateMovieForm (req, res) {
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
                // ratings omzetten naar array van strings
                const ratingStrings = ratings.map(r => r.rating);
                // categories loggen als array van category_name
                logger.debug('Recieved categories: ' + categories.map(c => c.category_name).join(', ') +
                            ', ratings: ' + ratingStrings.join(', '));
                res.render('pages/movieManagement/movieCreate', { categories, ratings: ratingStrings, errors: [] });
            });
        });
    },
    createMovie (req, res) {
        const { title, description, release_year, language_name, category_id, rating, rental_duration, rental_rate, length, inventory } = req.body;
        logger.debug(`Creating movie with data: title=${title}, description=${description}, release_year=${release_year}, language_name=${language_name}, category_id=${category_id}, rating=${rating}, rental_duration=${rental_duration}, rental_rate=${rental_rate}, length=${length}, inventory=${inventory}`);
        movieService.createMovie({ title, description, release_year, language_name, category_id, rating, rental_duration, rental_rate, length, inventory }, (error, movie) => {
            if (error) {
                logger.error(`Error creating movie: ${error.message}`);
                return res.status(500).render('pages/error', { 
                    message: 'Fout bij het aanmaken van film', 
                    error: { status: 500, stack: error.stack } 
                });
            }
            logger.info(`Movie created successfully: ${movie.title}`);
            res.redirect('/movieManagement');
        });
    }
};

module.exports = movieController;