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

    if (!first_name) errors.push('First name is required.');
    if (!last_name) errors.push('Last name is required.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Please enter a valid email address.');
    if (!address) errors.push('Address is required.');
    if (!city) errors.push('City is required.');
    if (!district) errors.push('District is required.');
    if (!country) errors.push('Country is required.');
    if (!phone || !/^(\+?\d{1,3}[- ]?)?\d{10}$/.test(phone)) errors.push('Please enter a valid phone number (10 digits, optional country code).');
    
    return errors;
}

module.exports = customerValidation;