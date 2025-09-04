const express = require('express');
const router = express.Router();

// Hardcoded About page
router.get('/', (req, res) => {
  res.render('pages/about', { title: 'Over deze applicatie' });
});

module.exports = router;