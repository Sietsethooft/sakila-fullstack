const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('pages/login', { showFooter: false }); // Render login page without footer
});

module.exports = router;