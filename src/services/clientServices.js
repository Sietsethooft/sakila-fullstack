const clientDao = require('../dao/clientDao');

const clientService = {
    getClients(search, callback) {
        clientDao.getClients(search, callback);
    },
    getClientDetails(customer_id, callback) {
        clientDao.getClientDetails(customer_id, callback);
    },
    deleteClient(customer_id, callback) {
        clientDao.deleteClient(customer_id, callback);
    },
    createClient(clientData, callback) {
        clientDao.createClient(clientData, callback);
    },
    updateClient(customer_id, clientData, callback) {
        clientDao.updateClient(customer_id, clientData, callback);
    },
    getClientIdByEmail(email, callback) {
        clientDao.getClientIdByEmail(email, callback);
    },
    getTotalCustomersCount: (callback) => {
        clientDao.getTotalCustomersCount(callback);
    }
};

module.exports = clientService;