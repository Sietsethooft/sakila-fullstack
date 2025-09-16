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
    },
    getAllOpenRentals(callback) {
        rentalDao.getAllOpenRentals(callback);
    },
    getAllOverdueRentals(callback) {
        rentalDao.getAllOverdueRentals(callback);
    },
    createRental(rentalData, callback) {
        rentalDao.createRental(rentalData, callback);
    },
    closeRental(rentalData, callback) {
        rentalDao.closeRental(rentalData, callback);
    },
    getActiveRentalsCount(callback) {
        rentalDao.getActiveRentalsCount(callback);
    },
    getOverdueRentalsCount(callback) {
        rentalDao.getOverdueRentalsCount(callback);
    }
};

module.exports = rentalService;