const clientServices = require('../services/clientServices');
const rentalServices = require('../services/rentalServices');
const staffServices = require('../services/staffServices');
const logger = require('../utils/logger');

const clientController = {
    getAllClients(req, res){
        const search = req.query.search || '';
        clientServices.getClients(search, (error, clients) => {
            if (error) {
                logger.error(`Error retrieving client details: ID ${customer_id}, Error: ${error.message}`);
                res.status(500).render('pages/error', {
                    message: 'Fout bij het ophalen van klantgegevens',
                    error: { status: 500, stack: error.stack }
                });
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
                logger.error(`Error retrieving client details: ID ${customer_id}, Error: ${error.message}`);
                res.status(500).render('pages/error', {
                    message: 'Fout bij het ophalen van klantgegevens',
                    error: { status: 500, stack: error.stack }
                });
            } else if (!client) {
                logger.warn(`Client not found: ID ${customer_id}`); 
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
                        logger.error(`Error retrieving active rentals for client ID ${customer_id}: ${activeError.message}`);
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
                                logger.error(`Error retrieving rental history for client ID ${customer_id}: ${rentalError.message}`);
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
                logger.error(`Error checking active rentals for client ID ${customer_id}: ${err.message}`);
                res.status(500).render('pages/error', {
                    message: 'Fout bij het controleren van openstaande verhuren',
                    error: { status: 500, stack: err.stack }
                });
            } else if (activeRentals && activeRentals.length > 0) {
                logger.warn(`Cannot delete client ID ${customer_id}: active rentals exist`);
                res.redirect(`/clientManagement/${customer_id}?error=Klant kan niet worden verwijderd: er zijn nog openstaande verhuren.`);
            } else {
                clientServices.deleteClient(customer_id, (deleteErr) => {
                    if (deleteErr) {
                        logger.error(`Error deleting client ID ${customer_id}: ${deleteErr.message}`);
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
        const staff_id = res.locals.user ? res.locals.user.id : undefined;
        logger.debug(`staff_id from JWT: ${staff_id}`);

        staffServices.getStoreIdByStaffId(staff_id, (err, storeId) => {
            if (err) {
                logger.error(`Error fetching store_id for staff_id ${staff_id}: ${err.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Fout bij het ophalen van store_id',
                    error: { status: 500, stack: err.stack }
                }); 
            }

            logger.debug(`Store ID ${storeId} fetched for staff ID ${staff_id}`);

            clientServices.createClient({first_name, last_name, email, address, city, district, country, postal_code, phone, storeId}, (err, result) => {
                if (err) {
                    logger.error(`Error creating client: ${err.message}`);
                    return res.status(500).render('pages/error', {
                        message: 'Fout bij het aanmaken van klant',
                        error: { status: 500, stack: err.stack }
                    });
                }
                logger.debug(`Client created: ID ${result.customer_id}, Name: ${first_name} ${last_name}`);
                res.redirect(`/clientManagement/${result.customer_id}`);
            });
        });
    },
    getEditClientForm(req, res) {
        const customer_id = req.params.id;
        clientServices.getClientDetails(customer_id, (error, client) => {
            if (error) {
                logger.error(`Error fetching client for edit: ID ${customer_id}, Error: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Fout bij het ophalen van klantgegevens',
                    error: { status: 500, stack: error.stack }
                });
            }
            if (!client) {
                logger.warn(`Client not found for edit: ID ${customer_id}`);
                return res.status(404).render('pages/error', {
                    message: 'Klant niet gevonden',
                    error: { status: 404, stack: '' }
                });
            }
            res.render('pages/clientManagement/clientEdit', {data: {client: {...client, customer_id: customer_id}}});
        });
    },
    updateClient(req, res) {
        const customer_id = req.params.id;
        const { first_name, last_name, email, address, city, district, country, postal_code, phone } = req.body;
        clientServices.updateClient(customer_id, {first_name, last_name, email, address, city, district, country, postal_code, phone}, (error) => {
            if (error) {
                logger.error(`Error updating client: ID ${customer_id}, Error: ${error.message}`);
                return res.status(500).render('pages/error', {
                    message: 'Fout bij het bijwerken van klantgegevens',
                    error: { status: 500, stack: error.stack }
                });
            }
            logger.debug(`Client updated: ID ${customer_id}, Name: ${first_name} ${last_name}`);
            res.redirect(`/clientManagement/${customer_id}`);
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