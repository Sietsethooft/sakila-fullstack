const clientServices = require('../services/clientServices');
const rentalServices = require('../services/rentalServices');
const revenueServices = require('../services/revenueServices');
const movieServices = require('../services/movieServices');
const logger = require('../utils/logger');

const dashboardController = {
    getDashboardInformation: (req, res) => {
        rentalServices.getActiveRentalsCount((error, active_rentals_count) => {
            if (error) {
                logger.error('Error fetching active rentals count:', error);
                return res.status(500).render('pages/error', {
                    message: 'Internal Server Error',
                    error: { status: 500, stack: error.stack }
                });
            }

            rentalServices.getOverdueRentalsCount((error, overdue_rentals_count) => {
                if (error) {
                    logger.error('Error fetching overdue rentals count:', error);
                    return res.status(500).render('pages/error', {
                        message: 'Internal Server Error',
                        error: { status: 500, stack: error.stack }
                    });
                }

                revenueServices.getRevenueThisMonth((error, revenue_this_month) => {
                    if (error) {
                        logger.error('Error fetching revenue this month:', error);
                        return res.status(500).render('pages/error', {
                            message: 'Internal Server Error',
                            error: { status: 500, stack: error.stack }
                        });
                    }

                    clientServices.getTotalCustomersCount((error, total_customers_count) => {
                        if (error) {
                            logger.error('Error fetching total customers count:', error);
                            return res.status(500).render('pages/error', {
                                message: 'Internal Server Error',
                                error: { status: 500, stack: error.stack }
                            });
                        }

                        movieServices.getTopMovies((error, top_movies) => {
                            if (error) {
                                logger.error('Error fetching top movies:', error);
                                return res.status(500).render('pages/error', {
                                    message: 'Internal Server Error',
                                    error: { status: 500, stack: error.stack }
                                });
                            }

                            res.render('pages/dashboard', {
                                data: {
                                    active_rentals_count,
                                    overdue_rentals_count,
                                    revenue_this_month,
                                    total_customers_count,
                                    top_movies
                                }
                            });
                        });
                    });
                });
            });
        });
    }
}
module.exports = dashboardController;