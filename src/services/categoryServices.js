const categoryDao = require('../dao/categoryDao');

const categoryService = {
    getCategories(callback){
        categoryDao.getCategories(callback);
    }
};

module.exports = categoryService;