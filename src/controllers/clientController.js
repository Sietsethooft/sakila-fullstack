const clientServices = require('../services/clientServices');
const rentalServices = require('../services/rentalServices');

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
    getClientDetails(req, res) {
    const clientId = req.params.id;
    clientServices.getClientDetails(clientId, (error, client) => {
        if (error) {
            res.status(500).render('pages/error', {
                message: 'Fout bij het ophalen van klantgegevens',
                error: { status: 500, stack: error.stack }
            });
        } else if (!client) {
            res.status(404).render('pages/error', {
                message: 'Klant niet gevonden',
                error: { status: 404, stack: '' }
            });
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

            rentalServices.getActiveRentalsByClientId(clientId, (activeError, activeRentals) => {
                if (activeError) {
                    res.status(500).send('Error retrieving active rentals');
                } else {
                    const formattedActiveRentals = activeRentals.map(rental => ({
                        film: rental.title,
                        verhuurd_op: formatDate(rental.Verhuurd_op),
                        te_retourneren_voor: formatDate(rental.Te_retourneren_voor),
                        prijs: `€${Number(rental.Prijs).toFixed(2).replace('.', ',')}`
                    }));

                    rentalServices.getRentalHistoryByClientId(clientId, (rentalError, rentals) => {
                        if (rentalError) {
                            res.status(500).send('Error retrieving rental history');
                        } else {
                            const formattedRentals = rentals.map(rental => ({
                                film: rental.title,
                                verhuurd_op: formatDate(rental.rental_date),
                                teruggebracht_op: rental.return_date ? formatDate(rental.return_date) : 'Nog niet terug',
                                prijs: `€${Number(rental.amount).toFixed(2).replace('.', ',')}`
                            }));
                            res.render('pages/clientManagement/clientDetail', {
                                data: { client: formattedClient },
                                activeRentals: formattedActiveRentals,
                                rentals: formattedRentals
                            });
                        }
                    });
                }
            });
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