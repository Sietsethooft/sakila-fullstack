const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');

router.get('/', rentalController.getAllRentals);

module.exports = router;