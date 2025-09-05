const clientServices = require('../services/clientServices');

const clientController = {
    getAllClients(req, res){
        clientServices.getClients((error, clients) => {
            if (error) {
                res.status(500).send('Error retrieving clients');
            } else {
                const formattedClients = clients.map(client => {// Format date as dd/mm/yyyy
                    const date = new Date(client.last_update);
                    const formattedDate = `${date.getDate().toString().padStart(2, '0')}/` +
                                          `${(date.getMonth()+1).toString().padStart(2, '0')}/` +
                                          `${date.getFullYear()}`;
                    return {
                        naam: `${client.first_name} ${client.last_name}`,
                        email: client.email,
                        active: client.active ? 'Ja' : 'Nee',
                        last_update: formattedDate
                    };
                });
                res.render('pages/clientManagement/clientindex', { clients: formattedClients });
            }
        });
    }
};

module.exports = clientController;