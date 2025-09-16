const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/authMiddleware');
const movieValidation = require('../middleware/validation/movieValidation');

router.get('/', authMiddleware, movieController.getAllMovies);
router.get('/create', authMiddleware, movieController.renderCreateMovieForm);
router.get('/:id/edit', authMiddleware, movieController.getEditMovieForm);

router.post('/create', authMiddleware, movieValidation.createValidation, movieController.createMovie);
router.post('/:id/delete', authMiddleware, movieController.deleteMovie);
router.post('/:id/update', authMiddleware, movieValidation.updateValidation, movieController.updateMovie);

router.get('/:id', authMiddleware, movieController.getMovieById);

module.exports = router;    