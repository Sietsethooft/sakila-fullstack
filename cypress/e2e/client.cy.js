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

        cy.get('input[name="first_name"]').type('Testy');
        cy.get('input[name="last_name"]').type('McTestface');
        cy.get('input[name="email"]').type('testy.mctestface@example.com');
        cy.get('input[name="address"]').type('Teststraat 1');
        cy.get('input[name="city"]').type('Teststad');
        cy.get('input[name="district"]').type('Testdistrict');
        cy.get('input[name="country"]').type('Testland');
        cy.get('input[name="postal_code"]').type('1234AB');
        cy.get('input[name="phone"]').type('0612345678');

        cy.get('button[type="submit"]').contains('Save').click();

        // Check if you are redirected to the client detail page with success message
        cy.url().should('match', /\/clientManagement\/\d+\?success=1/);
        cy.contains('Testy McTestface');
    });

    
});