const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/authMiddleware');
const movieValidation = require('../middleware/validation/movieValidation');

router.get('/', authMiddleware, movieController.getAllMovies);
router.get('/create', authMiddleware, movieController.renderCreateMovieForm);

router.post('/create', authMiddleware, movieValidation.createValidation, movieController.createMovie);
router.post('/:id/delete', authMiddleware, movieController.deleteMovie);

router.get('/:id', authMiddleware, movieController.getMovieById);

module.exports = router;    