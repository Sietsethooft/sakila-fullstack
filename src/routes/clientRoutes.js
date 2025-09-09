const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');

router.get('/', clientController.getAllClients);
router.get('/:id', clientController.getClientDetails);
router.get('/create', (req, res) => {
    res.render('pages/clientManagement/clientCreate');
});

module.exports = router;