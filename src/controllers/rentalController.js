const rentalServices = require('../services/rentalServices');
const movieServices = require('../services/movieServices');
const logger = require('../utils/logger');
const formatDate  = require('../utils/formatDate');
const { getMovies } = require('../dao/movieDao');

const rentalController = {
    getAllRentals(req, res) {

        rentalServices.getAllOpenRentals((err, openRentals) => {
            if (err) {
                logger.error(`Error retrieving open rentals: ${err.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error retrieving open rentals',
                    error: { status: 500, stack: err.stack }
                });
            }

            rentalServices.getAllOverdueRentals((err2, overdueRentals) => {
                if (err2) {
                    logger.error(`Error retrieving overdue rentals: ${err2.message}`);
                    return res.status(500).render('pages/error', {
                        message: 'Error retrieving overdue rentals',
                        error: { status: 500, stack: err2.stack }
                    });
                }

                    // Format dates in open rentals and overdue rentals
                    if (Array.isArray(overdueRentals)) {
                        overdueRentals.forEach(rental => {
                            if (rental.rental_date) rental.rental_date = formatDate(rental.rental_date);
                            if (rental.due_date) rental.due_date = formatDate(rental.due_date);
                        });
                    }
                    if (Array.isArray(openRentals)) {
                        openRentals.forEach(rental => {
                            if (rental.rental_date) rental.rental_date = formatDate(rental.rental_date);
                            if (rental.return_by) rental.return_by = formatDate(rental.return_by);
                        });
                    }

                logger.debug(`Open rentals: ${openRentals.length}, Overdue rentals: ${overdueRentals.length}`);

                res.render('pages/rentalManagement/rentalIndex', {
                    openRentals: openRentals,
                    overdueRentals: overdueRentals
                });
            });
        });
    },
    getCreateRentalForm(req, res) {
        movieServices.getMovieAvailabilities((err, movies) => {
            if (err) {
                logger.error(`Error retrieving movies for rental creation: ${err.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error retrieving movies for rental creation',
                    error: { status: 500, stack: err.stack }
                });
            }
            res.render('pages/rentalManagement/rentalCreate', {
                movies: movies
            });
        });
    }
};

module.exports = rentalController;