const rentalServices = require('../services/rentalServices');
const movieServices = require('../services/movieServices');
const clientService = require('../services/clientServices');
const logger = require('../utils/logger');
const formatDate  = require('../utils/formatDate');

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
    },
    createRental(req, res) {
        const { customerEmail, movieId } = req.body;
        console.debug(req.body);
        const staff_id = res.locals.user ? res.locals.user.id : undefined;

        clientService.getClientIdByEmail(customerEmail, (err, client) => {
            if (err) {
                logger.error(`Error retrieving client by email: ${err.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Error retrieving client by email',
                    error: { status: 500, stack: err.stack }
                });
            }
            if (!client) {
                logger.warn(`No client found with email: ${customerEmail}`);
                return res.status(400).render('pages/error', {
                    message: 'No client found with this email',
                    error: { status: 400 }
                });
            }

            logger.debug(`Client retrieved by email ${customerEmail}: ${JSON.stringify(client)}`);

            const customer_id = client;

                movieServices.getInventoryByFilmId(movieId, (err2, inventory) => {
                    if (err2) {
                        logger.error(`Error retrieving inventory for film ID ${movieId}: ${err2.message}`);
                        return res.status(500).render('pages/error', {
                            message: 'Error retrieving inventory for film',
                            error: { status: 500, stack: err2.stack }
                        });
                    }
                    logger.debug(`Inventory retrieved for film ID ${movieId}: ${JSON.stringify(inventory)}`);

                    const inventory_id = inventory.inventory_id;

                    logger.debug(`Creating rental with customer_id: ${customer_id}, inventory_id: ${inventory_id}, staff_id: ${staff_id}`);

                        rentalServices.createRental({ customer_id, inventory_id, staff_id }, (err, rental) => {
                            if (err) {
                                logger.error(`Error creating rental: ${err.message}`);
                                return res.status(500).render('pages/error', {
                            message: 'Error creating rental',
                            error: { status: 500, stack: err.stack }
                        });
                    }
                    res.redirect('/rentalManagement');
                });
            });
        });
    }
};

module.exports = rentalController;