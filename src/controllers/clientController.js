const clientServices = require('../services/clientServices');
const rentalServices = require('../services/rentalServices');
const logger = require('../utils/logger');

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
                        name: `${client.first_name} ${client.last_name}`,
                        email: client.email,
                        active: client.active ? 'Ja' : 'Nee',
                        last_update: formatDate(client.last_update)
                    };
                });
                logger.debug(`Amount of clients: ${formattedClients.length}`);
                res.render('pages/clientManagement/clientIndex', { clients: formattedClients });
            }
        });
    },
    getClientDetails(req, res) {
        const customer_id = req.params.id;
        const errorMessage = req.query.error || null;
        clientServices.getClientDetails(customer_id, (error, client) => {
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
                    name: `${client.first_name} ${client.last_name}`,
                    email: client.email,
                    phone: client.phone,
                    active: client.active ? 'Ja' : 'Nee',
                    address: `${client.address}, ${client.city}, ${client.district}, ${client.country}`,
                    postal_code: client.postal_code,
                    created_at: formatDate(client.create_date),
                    updated_at: formatDate(client.last_update),
                    customer_id: customer_id
                };

                rentalServices.getActiveRentalsByCustomerId(customer_id, (activeError, activeRentals) => {
                    if (activeError) {
                        res.status(500).send('Error retrieving active rentals');
                    } else {
                        const formattedActiveRentals = activeRentals.map(rental => ({
                            title: rental.title,
                            hired_on: formatDate(rental.hired_on),
                            return_by: formatDate(rental.return_by),
                            price: `€${Number(rental.price).toFixed(2).replace('.', ',')}`
                        }));

                        rentalServices.getRentalHistoryByCustomerId(customer_id, (rentalError, rentals) => {
                            if (rentalError) {
                                res.status(500).send('Error retrieving rental history');
                            } else {
                                const formattedRentals = rentals.map(rental => ({
                                    title: rental.title,
                                    hired_on: formatDate(rental.rental_date),
                                    returned_on: rental.return_date ? formatDate(rental.return_date) : 'Nog niet terug',
                                    price: `€${Number(rental.amount).toFixed(2).replace('.', ',')}`
                                }));
                                logger.debug(`Client details viewed: ID ${customer_id}, Name: ${formattedClient.name}`);
                                res.render('pages/clientManagement/clientDetail', {
                                    data: { client: formattedClient },
                                    activeRentals: formattedActiveRentals,
                                    rentals: formattedRentals,
                                    error: errorMessage
                                });
                            }
                        });
                    }
                });
            }
        });
    },
    deleteClient(req, res) {
        const customer_id = req.params.id;
        logger.debug(`Attempting to delete client: ID ${customer_id}`);
        rentalServices.getActiveRentalsByCustomerId(customer_id, (err, activeRentals) => { // Check for active rentals
            if (err) {
                res.status(500).render('pages/error', {
                    message: 'Fout bij het controleren van openstaande verhuren',
                    error: { status: 500, stack: err.stack }
                });
            } else if (activeRentals && activeRentals.length > 0) {
                logger.error(`Attempt to delete client with active rentals: ID ${customer_id}`);
                res.redirect(`/clientManagement/${customer_id}?error=Klant kan niet worden verwijderd: er zijn nog openstaande verhuren.`);
            } else {
                clientServices.deleteClient(customer_id, (deleteErr) => {
                    if (deleteErr) {
                        res.status(500).render('pages/error', {
                            message: 'Fout bij het verwijderen van klant',
                            error: { status: 500, stack: deleteErr.stack }
                        });
                    } else {
                        logger.debug(`Client deleted: ID ${customer_id}`);
                        res.redirect('/clientManagement');
                    }
                });
            }
        });
    },
    createClient(req, res) {
        const { first_name, last_name, email, address, city, district, country, postal_code, phone } = req.body;

        // Validation of required fields
        if (!first_name || !last_name || !email || !address || !city || !district || !country || !phone) {
            return res.status(400).render('pages/clientManagement/clientCreate', {
                error: 'Vul alle verplichte velden in.'
            });
        }

        clientServices.createClient({first_name, last_name, email, address, city, district, country, postal_code, phone}, (err, result) => {
            if (err) {
                return res.status(500).render('pages/error', {
                    message: 'Fout bij het aanmaken van klant',
                    error: { status: 500, stack: err.stack }
                });
            }
            logger.debug(`Client created: ID ${result.insertId}, Name: ${first_name} ${last_name}`);
            res.redirect('/clientManagement');
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