const clientServices = require('../services/clientServices');

const clientController = {
    getAllClients(req, res){
        const search = req.query.search || '';
        clientServices.getClients(search, (error, clients) => {
            if (error) {
                res.status(500).send('Error retrieving clients');
            } else {
                const formattedClients = clients.map(client => {
                    return {
                        customer_id: client.customer_id,
                        naam: `${client.first_name} ${client.last_name}`,
                        email: client.email,
                        active: client.active ? 'Ja' : 'Nee',
                        last_update: formatDate(client.last_update)
                    };
                });
                res.render('pages/clientManagement/clientIndex', { clients: formattedClients });
            }
        });
    },
    getClientById(req, res) {
        const clientId = req.params.id;
        clientServices.getClientDetails(clientId, (error, client) => {
            if (error) {
                res.status(500).send('Error retrieving client details');
            } else if (!client) {
                res.status(404).send('Client not found');
            } else {
                const formattedClient = {
                    klantnaam: `${client.first_name} ${client.last_name}`,
                    email: client.email,
                    actief: client.active ? 'Ja' : 'Nee',
                    adres: `${client.address}, ${client.city}, ${client.district}, ${client.country}`,
                    aangemaakt_op: formatDate(client.create_date),
                    laatste_update: formatDate(client.last_update),
                    id: clientId
                };
                console.log(Object.keys(formattedClient));
                res.render('pages/clientManagement/clientDetail', { data: { client: formattedClient } });
            }
        });
    }
};

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/` +
           `${(date.getMonth()+1).toString().padStart(2, '0')}/` +
           `${date.getFullYear()}`;
}

module.exports = clientController;