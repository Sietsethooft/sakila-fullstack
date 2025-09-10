const express = require('express');
const router = express.Router();
const customerValidation = require('../middleware/validation/customerValidation');

const clientController = require('../controllers/clientController');

router.get('/', clientController.getAllClients);
router.get('/create', (req, res) => {
    res.render('pages/clientManagement/clientCreate', { errors: [], old: {} });
});

router.post('/:id/delete', clientController.deleteClient);
router.post('/create', customerValidation, clientController.createClient);

router.get('/:id', clientController.getClientDetails);

module.exports = router;