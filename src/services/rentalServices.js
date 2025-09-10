const rentalDao = require('../dao/rentalDao');

const rentalService = {
    getRentalHistoryByClientId(clientId, callback) {
        rentalDao.getRentalHistoryByClientId(clientId, callback);
    },
    getActiveRentalsByClientId(clientId, callback) {
        rentalDao.getActiveRentalsByClientId(clientId, callback);
    }
};

module.exports = rentalService;