const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');

router.get('/', clientController.getAllClients);
router.get('/create', (req, res) => {
    res.render('pages/clientManagement/clientCreate');
});
router.get('/:id', clientController.getClientDetails);

module.exports = router;