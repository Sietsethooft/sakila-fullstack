describe('Client Management', () => {
    // Always login first
    beforeEach(() => {
        cy.visit('/auth/login');
        cy.get('input[name="username"]').type('mike');
        cy.get('input[name="password"]').type('secret');
        cy.get('button[type="submit"]').click();
        cy.visit('/clientManagement');
    });

    it('Can search for Mary Smith and see her in the results', () => {
        const clientName = 'Mary Smith';
        cy.get('input[name="search"]').type(clientName);
        cy.get('button.btn-search[type="submit"]').click();
        cy.get('tr.client-row').should('exist');
        cy.get('tr.client-row').first().within(() => {
        cy.contains('MARY SMITH');
        });
    });

    it('Can add a new client', () => {
        cy.get('#add-client-btn').scrollIntoView().click({ force: true });
        cy.url().should('include', '/clientManagement/create');

        cy.get('input[name="first_name"]').type('Liam');
        cy.get('input[name="last_name"]').type('Anderson');
        cy.get('input[name="email"]').type('Liam.Anderson@example.com');
        cy.get('input[name="address"]').type('123 Main Street');
        cy.get('input[name="city"]').type('Springfield');
        cy.get('input[name="district"]').type('Downtown');
        cy.get('input[name="country"]').type('United States');
        cy.get('input[name="postal_code"]').type('90210');
        cy.get('input[name="phone"]').type('5551234567');

        cy.get('button[type="submit"]').contains('Save').click();

        // Check if you are redirected to the client detail page with success message
        cy.url().should('match', /\/clientManagement\/\d+\?success=1/);
        cy.contains('Liam Anderson');
    });

    it('Can update the postal code of Liam Anderson', () => {
        // Search for the user
        cy.get('input[name="search"]').clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]').click();
        cy.get('tr.client-row').contains('Liam Anderson').click();

        // Click the Edit button
        cy.url().should('match', /\/clientManagement\/\d+/);
        cy.get('a.btn-warning').contains('Edit').click();

        // Change the postal code
        cy.url().should('match', /\/clientManagement\/\d+\/edit/);
        cy.get('input[name="postal_code"]').clear().type('5678XY');
        cy.get('button[type="submit"]').contains('Save').click();

        // Check redirect and success message
        cy.url().should('match', /\/clientManagement\/\d+\?success=2/);
        cy.contains('Client updated successfully!');

        // Click OK in the Swal2 popup if it appears
        cy.get('.swal2-confirm').click();

        // Check if the postal code is updated in the table
        cy.get('th').contains('Postal Code').parent().find('td').should('have.text', '5678XY');
    });

    it('Can create a rental for Liam Anderson and sees it in the table', () => {
        // Search and open detail page of Liam Anderson
        cy.get('input[name="search"]').clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]').click();
        cy.get('tr.client-row').contains('Liam Anderson').click();

        // Click the "New Rental" button
        cy.get('a').contains('New Rental').click();

        // Check that you are on the rental create page and the email field is filled
        cy.url().should('include', '/rentalManagement/create');
        cy.get('input[name="customerEmail"]').should('have.value', 'Liam.Anderson@example.com');

        // Type "academy dinosaur" and select it from the dropdown
        cy.get('#movieSearch').type('academy dinosaur');
        cy.get('#results').contains(/academy dinosaur/i).click();

        // Click submit
        cy.get('button[type="submit"]').contains('Submit Rental').click();

        // Check redirect to client detail with success=5
        cy.url().should('match', /\/clientManagement\/\d+\?success=5/);

        // Click OK in the Swal2 popup
        cy.get('.swal2-confirm').click();

        // Check if the table contains a row with "ACADEMY DINOSAUR"
        cy.get('table').contains('td', 'ACADEMY DINOSAUR').should('exist');
    });

    it('Shows error popup when trying to delete Liam Anderson with outstanding rentals', () => {
        // Search for the user and open detail page
        cy.get('input[name="search"]').clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]').click();
        cy.get('tr.client-row').contains('Liam Anderson').click();

        // Click the delete button
        cy.get('#delete-client-btn').click();

        // Confirm the Swal2 popup
        cy.get('.swal2-confirm').contains('Yes, delete').click();

        // Check that the error popup appears with correct title and message
        cy.get('.swal2-popup.swal2-modal.swal2-icon-error').should('be.visible');
        cy.get('.swal2-title').should('contain', 'Client cannot be deleted');
        cy.get('.swal2-html-container').should('contain', 'There are still outstanding rentals.');
    });

    it('Can return a rental for Liam Anderson and sees no outstanding rentals left', () => {
        // Search and open detail page of Liam Anderson
        cy.get('input[name="search"]').clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]').click();
        cy.get('tr.client-row').contains('Liam Anderson').click();

        // Find the correct rental and click the return button (✓)
        cy.get('table').contains('td', 'ACADEMY DINOSAUR').parent().within(() => {
            cy.get('button.return-rental').click();
        });

        // Confirm the Swal2 popup
        cy.get('.swal2-confirm').contains('Yes, close').click();

        // Check redirect to client detail with success=4
        cy.url().should('match', /\/clientManagement\/\d+\?success=4/);

        // Click OK in the Swal2 popup
        cy.get('.swal2-confirm').click();

        // Check if the table contains "No outstanding rentals found."
        cy.get('table').contains('td.text-center', 'No outstanding rentals found.').should('exist');
    });

    it('Can delete the user Liam Anderson', () => {
        // Search for the user and open detail page
        cy.get('input[name="search"]').clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]').click();
        cy.get('tr.client-row').contains('Liam Anderson').click();

        // Click the delete button
        cy.get('#delete-client-btn').click();

        // Confirm the Swal2 popup
        cy.get('.swal2-confirm').contains('Yes, delete').click();

        // Check redirect and success message in the url
        cy.url().should('include', '/clientManagement?success=3');

        // Click OK in the Swal2 popup if it appears
        cy.get('.swal2-confirm').click();

        // Search again by name, check that there are no results
        cy.get('input[name="search"]').clear().type('Liam Anderson');
        cy.get('button.btn-search[type="submit"]').click();
        cy.get('td.text-center').should('contain', 'No clients found.');
    });

});