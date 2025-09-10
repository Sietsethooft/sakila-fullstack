const clientDao = require('../dao/clientDao');

const clientService = {
    getClients(search, callback) {
        clientDao.getClients(search, callback);
    },
    getClientDetails(clientId, callback) {
        clientDao.getClientDetails(clientId, callback);
    },
    deleteClient(clientId, callback) {
        clientDao.deleteClient(clientId, callback);
    },
    createClient(clientData, callback) {
        clientDao.createClient(clientData, callback);
    }
};

module.exports = clientService;