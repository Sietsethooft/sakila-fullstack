const ratingDao = require('../dao/ratingDao');

const ratingService = {
    getRatings(callback){
        ratingDao.getRatings(callback);
    }
};

module.exports = ratingService;