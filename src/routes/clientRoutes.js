const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const customerValidation = require('../middleware/validation/customerValidation');

const clientController = require('../controllers/clientController');

router.get('/', authMiddleware, clientController.getAllClients);
router.get('/create', authMiddleware, (req, res) => {
    res.render('pages/clientManagement/clientCreate', { errors: [], old: {} });
});
router.get('/:id/edit', authMiddleware, clientController.getEditClientForm);

router.post('/:id/delete', authMiddleware, clientController.deleteClient);
router.post('/create', authMiddleware, customerValidation, clientController.createClient);
router.post('/:id/update', authMiddleware, customerValidation, clientController.updateClient);

router.get('/:id', authMiddleware, clientController.getClientDetails);

module.exports = router;