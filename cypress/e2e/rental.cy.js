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
    });
});