const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, rentalController.getAllRentals);
router.get('/create', authMiddleware, rentalController.getCreateRentalForm);

module.exports = router;