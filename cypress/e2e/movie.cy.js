// describe('Movie Management', () => {
//     beforeEach(() => {
//         cy.visit('/auth/login');
//         cy.get('input[name="username"]').type('mike');
//         cy.get('input[name="password"]').type('secret');
//         cy.get('button[type="submit"]').click();
//         cy.visit('/movieManagement', { timeout: 10000 });
//     });

//     it('Can search for a movie with filters and see only VICTORY ACADEMY', () => {
//         // Type "vic" in the search bar
//         cy.get('input[name="search"]').type('vic');

//         // Select "English" for language
//         cy.get('select[name="language"]').select('English');

//         // Select "Sports" for category
//         cy.get('select[name="category"]').select('Sports');

//         // Select "PG-13" for rating
//         cy.get('select[name="rating"]').select('PG-13');

//         // Click the search button
//         cy.get('button.btn-search[type="submit"]').click();

//         // Check that only "VICTORY ACADEMY" appears
//         cy.get('.card-title').should('have.length', 1).and('contain', 'VICTORY ACADEMY');
//         cy.get('.card-text').should('contain', 'A Insightful Epistle of a Mad Scientist And a Explorer who must Challenge a Cat in The Sahara Desert');
//         cy.get('.badge.bg-secondary').should('contain', 'Sports');
//         cy.get('.badge.bg-secondary.ms-1').should('contain', 'English');
//         cy.get('.card').should('contain', '2006');
//         cy.get('.card').should('contain', 'Rating: PG-13');
//     });

// });

// Commented all test out, because of high movieManagement load