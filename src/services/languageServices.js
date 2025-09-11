const languageDao = require('../dao/languageDao');

const languageService = {
    getLanguages(callback){
        languageDao.getLanguages(callback);
    }
};

module.exports = languageService;