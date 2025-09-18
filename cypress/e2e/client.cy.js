describe('Client Management', () => {
    // Always login first
    beforeEach(() => {
        cy.visit('/auth/login', { timeout: 10000 });
        cy.get('input[name="username"]', { timeout: 10000 }).type('mike');
        cy.get('input[name="password"]', { timeout: 10000 }).type('secret');
        cy.get('button[type="submit"]', { timeout: 10000 }).click();
        cy.visit('/clientManagement', { timeout: 10000 });
    });

    it('Can search for Mary Smith and see her in the results', () => {
        const clientName = 'Mary Smith';
        cy.get('input[name="search"]', { timeout: 10000 }).type(clientName);
        cy.get('button.btn-search[type="submit"]', { timeout: 10000 }).click();

        cy.get('tr.client-row', { timeout: 10000 }).should('exist');
        cy.get('tr.client-row', { timeout: 10000 }).first().within(() => {
            cy.contains('MARY SMITH', { timeout: 10000 });
        });
    });

    it('Can add a new client', () => {
        cy.get('#add-client-btn', { timeout: 10000 }).scrollIntoView().click({ force: true });
        cy.url({ timeout: 10000 }).should('include', '/clientManagement/create');

        cy.get('input[name="first_name"]', { timeout: 10000 }).type('Liam');
        cy.get('input[name="last_name"]', { timeout: 10000 }).type('Anderson');
        cy.get('input[name="email"]', { timeout: 10000 }).type('Liam.Anderson@example.com');
        cy.get('input[name="address"]', { timeout: 10000 }).type('123 Main Street');
        cy.get('input[name="city"]', { timeout: 10000 }).type('Springfield');
        cy.get('input[name="district"]', { timeout: 10000 }).type('Downtown');
        cy.get('input[name="country"]', { timeout: 10000 }).type('United States');
        cy.get('input[name="postal_code"]', { timeout: 10000 }).type('90210');
        cy.get('input[name="phone"]', { timeout: 10000 }).type('5551234567');

        cy.get('button[type="submit"]', { timeout: 10000 }).contains('Save').click();

        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+\?success=1/);

        cy.get('.swal2-title', { timeout: 10000 }).should('have.text', 'Client added successfully!');
        cy.contains('Liam Anderson', { timeout: 10000 });
    });

    it('Can update the postal code of Liam Anderson', () => {
        cy.get('input[name="search"]', { timeout: 10000 }).clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]', { timeout: 10000 }).click();
        cy.get('tr.client-row', { timeout: 10000 }).contains('Liam Anderson').click();

        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+/);
        cy.get('a.btn-warning', { timeout: 10000 }).contains('Edit').click();

        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+\/edit/);
        cy.get('input[name="postal_code"]', { timeout: 10000 }).clear().type('5678XY');
        cy.get('button[type="submit"]', { timeout: 10000 }).contains('Save').click();

        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+\?success=2/);
        cy.contains('Client updated successfully!', { timeout: 10000 });

        cy.get('.swal2-title', { timeout: 10000 }).should('have.text', 'Client updated successfully!');
        cy.get('.swal2-confirm', { timeout: 10000 }).click();

        cy.get('th', { timeout: 10000 }).contains('Postal Code').parent().find('td').should('have.text', '5678XY');
    });

    it('Shows validation error when updating Liam Anderson with invalid phone number', () => {
        cy.get('input[name="search"]', { timeout: 10000 }).clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]', { timeout: 10000 }).click();
        cy.get('tr.client-row', { timeout: 10000 }).contains('Liam Anderson').click();

        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+/);
        cy.get('a.btn-warning', { timeout: 10000 }).contains('Edit').click();

        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+\/edit/);
        cy.get('input[name="phone"]', { timeout: 10000 }).clear().type('583945');
        cy.get('button[type="submit"]', { timeout: 10000 }).contains('Save').click();

        cy.get('li', { timeout: 10000 }).should('contain', 'Please enter a valid phone number (10 digits, optional country code).');
        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+\/update/);
    });

    it('Can create a rental for Liam Anderson and sees it in the table', () => {
        cy.get('input[name="search"]', { timeout: 10000 }).clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]', { timeout: 10000 }).click();
        cy.get('tr.client-row', { timeout: 10000 }).contains('Liam Anderson').click();

        cy.get('a', { timeout: 10000 }).contains('New Rental').click();

        cy.url({ timeout: 10000 }).should('include', '/rentalManagement/create');
        cy.get('input[name="customerEmail"]', { timeout: 10000 }).should('have.value', 'Liam.Anderson@example.com');

        cy.get('#movieSearch', { timeout: 10000 }).type('academy dinosaur');
        cy.get('#results', { timeout: 10000 }).contains(/academy dinosaur/i, { timeout: 10000 }).click();

        cy.get('button[type="submit"]', { timeout: 10000 }).contains('Submit Rental').click();

        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+\?success=5/);

        cy.get('.swal2-title', { timeout: 10000 }).should('have.text', 'Rental added successfully!');
        cy.get('.swal2-confirm', { timeout: 10000 }).click();

        cy.get('table', { timeout: 10000 }).contains('td', 'ACADEMY DINOSAUR').should('exist');
    });

    it('Shows error popup when trying to delete Liam Anderson with outstanding rentals', () => {
        cy.get('input[name="search"]', { timeout: 10000 }).clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]', { timeout: 10000 }).click();
        cy.get('tr.client-row', { timeout: 10000 }).contains('Liam Anderson').click();

        cy.get('#delete-client-btn', { timeout: 10000 }).click();
        cy.get('.swal2-confirm', { timeout: 10000 }).contains('Yes, delete').click();

        cy.get('.swal2-popup.swal2-modal.swal2-icon-error', { timeout: 10000 }).should('be.visible');
        cy.get('.swal2-title', { timeout: 10000 }).should('contain', 'Client cannot be deleted');
        cy.get('.swal2-html-container', { timeout: 10000 }).should('contain', 'There are still outstanding rentals.');
    });

    it('Can return a rental for Liam Anderson and sees no outstanding rentals left', () => {
        cy.get('input[name="search"]', { timeout: 10000 }).clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]', { timeout: 10000 }).click();
        cy.get('tr.client-row', { timeout: 10000 }).contains('Liam Anderson').click();

        cy.get('table', { timeout: 10000 }).contains('td', 'ACADEMY DINOSAUR').parent().within(() => {
            cy.get('button.return-rental', { timeout: 10000 }).click();
        });

        cy.get('.swal2-confirm', { timeout: 10000 }).contains('Yes, close').click();

        cy.url({ timeout: 10000 }).should('match', /\/clientManagement\/\d+\?success=4/);

        cy.get('.swal2-title', { timeout: 10000 }).should('have.text', 'Rental closed successfully!');
        cy.get('.swal2-confirm', { timeout: 10000 }).click();

        cy.get('table', { timeout: 10000 }).contains('td.text-center', 'No outstanding rentals found.').should('exist');
    });

    it('Can delete the user Liam Anderson', () => {
        cy.get('input[name="search"]', { timeout: 10000 }).clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]', { timeout: 10000 }).click();
        cy.get('tr.client-row', { timeout: 10000 }).contains('Liam Anderson').click();

        cy.get('#delete-client-btn', { timeout: 10000 }).click();
        cy.get('.swal2-confirm', { timeout: 10000 }).contains('Yes, delete').click();

        cy.url({ timeout: 10000 }).should('include', '/clientManagement?success=3');

        cy.get('.swal2-title', { timeout: 10000 }).should('have.text', 'Client deleted successfully!');
        cy.get('.swal2-confirm', { timeout: 10000 }).click();

        cy.get('input[name="search"]', { timeout: 10000 }).clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]', { timeout: 10000 }).click();
        cy.get('td.text-center', { timeout: 10000 }).should('contain', 'No clients found.');
    });
});