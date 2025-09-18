describe('Rental Management', () => {
    // Always login first
    beforeEach(() => {
        cy.visit('/auth/login');
        cy.get('input[name="username"]').type('mike');
        cy.get('input[name="password"]').type('secret');
        cy.get('button[type="submit"]').click();
        cy.visit('/rentalManagement');
    });

    it('should create a new rental and show it in the correct table', () => {
        // Click on "Create rental"
        cy.get('#add-movie-btn').click();

        // Check URL
        cy.url().should('include', '/rentalManagement/create');

        // Fill in email and film
        cy.get('input[name="customerEmail"]').type('MARY.SMITH@sakilacustomer.org');
        cy.get('#movieSearch').type('ACADEMY DINOSAUR');

        // Select the movie from the dropdown
        cy.get('#results .list-group-item').contains('ACADEMY DINOSAUR').click();

        // Click on "Submit Rental"
        cy.get('button[type="submit"]').contains('Submit Rental').click();

        // Check redirect to rentalManagement?success=1
        cy.url().should('include', '/rentalManagement?success=1');

        // Check alert
        cy.get('.swal2-title').should('have.text', 'Rental added successfully!');

        // Click OK in the Swal2 popup
        cy.get('.swal2-confirm').click();

        // Check that there is a "MARY SMITH" + "ACADEMY DINOSAUR" in the open rentals table
        cy.get('table.open-rentals-table tbody tr')
        .filter(':contains("MARY SMITH")')
        .filter(':contains("ACADEMY DINOSAUR")')
        .should('exist');
    });

    it('should show an error when entering an invalid email', () => {
        // Click on "Create rental"
        cy.get('#add-movie-btn').click();

        // Check URL
        cy.url().should('include', '/rentalManagement/create');

        // Fill in invalid email and film
        cy.get('input[name="customerEmail"]').type('no@legit.email');
        cy.get('#movieSearch').type('ACADEMY DINOSAUR');

        // Select the movie from the dropdown
        cy.get('#results .list-group-item').contains('ACADEMY DINOSAUR').click();

        // Click on "Submit Rental"
        cy.get('button[type="submit"]').contains('Submit Rental').click();

        // URL should stay on create page
        cy.url().should('include', '/rentalManagement/create');

        // Error alert should be visible
        cy.get('.alert.alert-danger[role="alert"]')
        .should('be.visible')
        .and('contain', 'No client found with this email address.');
    });

    it('should close the top rental for Mary Smith and show correct popups and table update', () => {
        cy.visit('/rentalManagement');

        // Find the open rentals table and click the first "MARY SMITH" + "ACADEMY DINOSAUR" return button
        cy.get('table.open-rentals-table tbody tr')
            .filter(':contains("MARY SMITH")')
            .filter(':contains("ACADEMY DINOSAUR")')
            .first()
            .within(() => {
                cy.get('button.return-rental').click({ force: true });
            });

        // Check the Swal2 popup
        cy.get('.swal2-title').should('have.text', 'Are you sure you want to close this rental?');
        cy.get('.swal2-confirm').should('contain', 'Yes, close');

        // Click "Yes, close"
        cy.get('.swal2-confirm').contains('Yes, close').click();

        // Check redirect and success popup
        cy.url().should('include', '/rentalManagement?success=3');
        cy.get('.swal2-title').should('have.text', 'Rental closed successfully!');

        // Click OK in the Swal2 popup
        cy.get('.swal2-confirm').click();

        // Check that there isnt still a "MARY SMITH" + "ACADEMY DINOSAUR" in the open rentals table
        cy.get('table.open-rentals-table tbody tr')
            .filter(':not(:contains("MARY SMITH"))')
            .filter(':not(:contains("ACADEMY DINOSAUR"))')
            .should('not.exist');
    });
});