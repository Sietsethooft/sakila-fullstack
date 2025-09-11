const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, (req, res) => {
    res.render('pages/movieManagement/movieIndex');
});

module.exports = router;