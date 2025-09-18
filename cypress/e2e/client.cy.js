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


    
});