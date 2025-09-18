describe('US01E4 - Login', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('Shows validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Please enter your username.');
    cy.contains('Please enter your password.');
  });

  it('Incorrect login shows error message', () => {
    cy.get('input[name="username"]').type('wronguser');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Username or password is incorrect.');
    cy.url().should('include', '/auth/login');
  });

  it('Correct login redirects to dashboard', () => {
    cy.get('input[name="username"]').type('mike');
    cy.get('input[name="password"]').type('secret');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome to MovieMate');
  });

  it('Protected page redirects when not logged in', () => {
    cy.clearCookies();
    cy.visit('/clientManagement');
    cy.url().should('include', '/auth/login');
  });
});

describe('US02E4 - Logout', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
    cy.get('input[name="username"]').type('mike');
    cy.get('input[name="password"]').type('secret');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('Logout ends session and redirects to login', () => {
    cy.get('form[action="/auth/logout"] button[type="submit"]').click();
    cy.url().should('include', '/auth/login');
  });

  it('No access to management pages after logout', () => {
    cy.get('form[action="/auth/logout"] button[type="submit"]').click();
    cy.visit('/clientManagement');
    cy.url().should('include', '/auth/login');
  });
});