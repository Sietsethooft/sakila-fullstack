const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, movieController.getAllMovies);
router.get('/:id', authMiddleware, (req, res) => {
  res.render('pages/movieManagement/movieDetail');
});

module.exports = router;