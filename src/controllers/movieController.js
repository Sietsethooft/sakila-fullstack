const movieService = require('../services/movieServices');
const languageService = require('../services/languageServices');
const categoryService = require('../services/categoryServices');
const ratingService = require('../services/ratingServices');
const rentalService = require('../services/rentalServices');
const staffServices = require('../services/staffServices');
const logger = require('../utils/logger');
const formatDate = require('../utils/formatDate');

const movieController = {
    getAllMovies (req, res) {
        const { search, language, category, rating } = req.query;
        const success = req.query.success || null;

        movieService.getMovies({ search, language, category, rating }, (error, movies) => {
            if (error) {
                logger.error(`Error retrieving movies: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error retrieving movies',
                    error: { status: 500, stack: error.stack }
                });
            }
            languageService.getLanguages((langError, languages) => {
                if (langError) {
                    logger.error(`Error retrieving languages: ${langError.message}`);
                    return res.status(500).render('pages/error', {
                        message: 'Error retrieving languages',
                        error: { status: 500, stack: langError.stack }
                    });
                }
                categoryService.getCategories((catError, categories) => {
                    if (catError) {
                        logger.error(`Error retrieving categories: ${catError.message}`);
                        return res.status(500).render('pages/error', {
                            message: 'Error retrieving categories',
                            error: { status: 500, stack: catError.stack }
                        });
                    }
                    ratingService.getRatings((ratError, ratings) => {
                        if (ratError) {
                            logger.error(`Error retrieving ratings: ${ratError.message}`);
                            return res.status(500).render('pages/error', {
                                message: 'Error retrieving ratings',
                                error: { status: 500, stack: ratError.stack }
                            });
                        }
                    logger.debug(`Movies retrieved successfully: ${movies.length} found`);
                    res.render('pages/movieManagement/movieIndex', { movies, languages, categories, ratings, success: success});
                    });
                });
            });
        });
    },
    getMovieById (req, res) {
        const film_id = req.params.id;
        const success = req.query.success || null;
        const errorMessage = req.query.error || null;
        movieService.getMovieById(film_id, (error, movie) => {
            if (error) {
                logger.error(`Error retrieving movie: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error retrieving movie',
                    error: { status: 500, stack: error.stack }
                });
            }
            else if (!movie) {
                logger.warn(`Movie not found: ID ${film_id}`);
                res.status(404).render('pages/error', {
                    message: 'Movie not found',
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
                            message: 'Error retrieving rental history',
                            error: { status: 500, stack: rentalError.stack }
                        });
                    }
                    if (activeError) {
                        logger.error(`Error retrieving active rentals: ${activeError.message}`);
                        return res.status(500).render('pages/error', {
                            message: 'Error retrieving active rentals',
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
                    res.render('pages/movieManagement/movieDetail', { movie, rentalHistory, activeRentals, success: success, error: errorMessage });
                });
            });
        });
    },
    renderCreateMovieForm (req, res) {
        categoryService.getCategories((catError, categories) => {
            if (catError) {
                logger.error(`Error retrieving categories: ${catError.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error retrieving categories',
                    error: { status: 500, stack: catError.stack }
                });
            }
            ratingService.getRatings((ratError, ratings) => {
                if (ratError) {
                    logger.error(`Error retrieving ratings: ${ratError.message}`);
                    return res.status(500).render('pages/error', {
                        message: 'Error retrieving ratings',
                        error: { status: 500, stack: ratError.stack }
                    });
                }
                const ratingStrings = ratings.map(r => r.rating);
                res.render('pages/movieManagement/movieCreate', { categories, ratings: ratingStrings, errors: [] });
            });
        });
    },
    createMovie (req, res) {
        let { title, description, release_year, language_name, category_id, rating, rental_duration, rental_rate, length, inventory } = req.body;
        const staff_id = res.locals.user ? res.locals.user.id : undefined;

        // Normalize language_name: first letter uppercase, rest lowercase
        if (language_name) {
            language_name = language_name.charAt(0).toUpperCase() + language_name.slice(1).toLowerCase();
        }

        staffServices.getStoreIdByStaffId(staff_id, (err, storeId) => {
            if (err) {
                logger.error(`Error fetching store_id for staff_id ${staff_id}: ${err.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error retrieving store_id',
                    error: { status: 500, stack: err.stack }
                }); 
            }   

            movieService.createMovie({ title, description, release_year, language_name, category_id, rating, rental_duration, rental_rate, length, inventory, storeId }, (error, movie) => {
                if (error) {
                    logger.error(`Error creating movie: ${error.message}`);
                    return res.status(500).render('pages/error', { 
                        message: 'Error creating movie', 
                        error: { status: 500, stack: error.stack } 
                    });
                }
                logger.info(`Movie created successfully: ${movie.title} with ID ${movie.film_id}`);
                res.redirect(`/movieManagement/${movie.film_id}?success=1`);
            });
        });
    },
    deleteMovie(req, res) {
        const film_id = req.params.id;
        logger.debug(`Attempting to delete movie: ID ${film_id}`);
        rentalService.getActiveRentalsByFilmId(film_id, (err, activeRentals) => { // Check for active rentals
            if (err) {
                logger.error(`Error checking active rentals for movie ID ${film_id}: ${err.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error checking outstanding rentals',
                    error: { status: 500, stack: err.stack }
                });
            } else if (activeRentals && activeRentals.length > 0) {
                logger.warn(`Cannot delete movie ID ${film_id}: active rentals exist`);
                return res.redirect(`/movieManagement/${film_id}?error=There are still outstanding rentals.`);
            } else {
                movieService.deleteMovie(film_id, (deleteErr) => {
                    if (deleteErr) {
                        logger.error(`Error deleting movie ID ${film_id}: ${deleteErr.message}`);
                        return res.status(500).render('pages/error', {
                            message: 'Error deleting movie',
                            error: { status: 500, stack: deleteErr.stack }
                        });
                    } else {
                        logger.debug(`Movie deleted: ID ${film_id}`);
                        return res.redirect('/movieManagement?success=3');
                    }
                });
            }
        });
    },
    getEditMovieForm(req, res) {
        const film_id = req.params.id;
        movieService.getMovieById(film_id, (error, movie) => {
            if (error) {
                logger.error(`Error fetching movie for edit: ID ${film_id}, Error: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error retrieving movie details',
                    error: { status: 500, stack: error.stack }
                });
            }
            if (!movie) {
                logger.warn(`Movie not found for edit: ID ${film_id}`);
                return res.status(404).render('pages/error', {
                    message: 'Movie not found',
                    error: { status: 404, stack: '' }
                });
            }
            categoryService.getCategories((catError, categories) => {
                if (catError) {
                    logger.error(`Error retrieving categories: ${catError.message}`);
                    return res.status(500).render('pages/error', {
                        message: 'Error retrieving categories',
                        error: { status: 500, stack: catError.stack }
                    });
                }
                ratingService.getRatings((ratError, ratings) => {
                    if (ratError) {
                        logger.error(`Error retrieving ratings: ${ratError.message}`);
                        return res.status(500).render('pages/error', {
                            message: 'Error retrieving ratings',
                            error: { status: 500, stack: ratError.stack }
                        });
                    }
                    const ratingStrings = ratings.map(r => r.rating || r);
                    res.render('pages/movieManagement/movieEdit', { movie, categories, ratings: ratingStrings });
                });
            });
        });
    },

    updateMovie(req, res) {
        const film_id = req.params.id;
        const { title, description, release_year, language_name, category_id, rating, rental_duration, rental_rate, length, inventory} = req.body;

        // Normalize language_name: first letter uppercase, rest lowercase
        let normalizedLanguage = language_name
            ? language_name.charAt(0).toUpperCase() + language_name.slice(1).toLowerCase()
            : language_name;

        movieService.updateMovie(film_id, {
            title, description, release_year, language_name: normalizedLanguage,
            category_id, rating, rental_duration, rental_rate, length, inventory
        }, (error) => {
            if (error) {
                logger.error(`Error updating movie: ID ${film_id}, Error: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error updating movie details',
                    error: { status: 500, stack: error.stack }
                });
            }
            logger.debug(`Movie updated: ID ${film_id}, Title: ${title}`);
            res.redirect(`/movieManagement/${film_id}?success=2`);
        });
    },
};

module.exports = movieController;