const rentalServices = require('../services/rentalServices');
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
    }
};

module.exports = rentalController;