const customerValidation = {
    createValidation(req, res, next) {
        const errors = validateCustomer(req.body);
        if (errors.length > 0) {
            return res.status(400).render('pages/clientManagement/clientCreate', { errors, old: req.body });
        }
        next();
    },
    updateValidation(req, res, next) {
        const errors = validateCustomer(req.body);
        if (errors.length > 0) {
            return res.status(400).render('pages/clientManagement/clientEdit', {
                errors,
                old: req.body,
                data: {
                    client: {
                        ...req.body,
                        customer_id: req.params.id
                    }
                }
            });
        }
        next();
    }
};

function validateCustomer(body) {
    const { first_name, last_name, email, address, city, district, country, phone } = body;
    const errors = [];

    if (!first_name) errors.push('Voornaam is verplicht.');
    if (!last_name) errors.push('Achternaam is verplicht.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Vul een geldig emailadres in.');
    if (!address) errors.push('Adres is verplicht.');
    if (!city) errors.push('Stad is verplicht.');
    if (!district) errors.push('District is verplicht.');
    if (!country) errors.push('Land is verplicht.');
    if (!phone || !/^(\+?\d{1,3}[- ]?)?\d{10}$/.test(phone)) errors.push('Vul een geldig telefoonnummer in (10 cijfers, optioneel landcode).');

    return errors;
}

module.exports = customerValidation;