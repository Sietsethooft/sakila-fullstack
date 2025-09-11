const rentalDao = require('../dao/rentalDao');

const rentalService = {
    getRentalHistoryByCustomerId(customer_id, callback) {
        rentalDao.getRentalHistoryByCustomerId(customer_id, callback);
    },
    getActiveRentalsByCustomerId(customer_id, callback) {
        rentalDao.getActiveRentalsByCustomerId(customer_id, callback);
    },
    getRentalHistoryByFilmId(film_id, callback) {
        rentalDao.getRentalHistoryByFilmId(film_id, callback);
    },
    getActiveRentalsByFilmId(film_id, callback) {
        rentalDao.getActiveRentalsByFilmId(film_id, callback);
    }
};

module.exports = rentalService;