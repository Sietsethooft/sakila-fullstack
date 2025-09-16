const revenueDao = require('../dao/revenueDao');

const revenueServices = {
    getRevenueThisMonth: (callback) => {
        revenueDao.getRevenueThisMonth(callback);
    }
}

module.exports = revenueServices;