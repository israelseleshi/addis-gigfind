describe('Authentication', () => {
  it('should log in as a client and then log out', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('israelseleshi09@gmail.com');
    cy.get('input[name="password"]').type('1234567890');
    cy.get('button[type="submit"]').contains('Sign In').click();

    cy.url().should('include', '/freelancer/dashboard');

    cy.get('header button').click();
    cy.get('button[type="submit"]').contains('Logout').click();

    cy.url().should('include', '/login');
  });

  it('should log in as a freelancer and then log out', () => {
    cy.visit('/login');

    cy.get('input[name="email"]').type('israeltheodros09@gmail.com');
    cy.get('input[name="password"]').type('12345678');
    cy.get('button[type="submit"]').contains('Sign In').click();

    cy.url().should('include', '/client/dashboard');

    cy.get('header button').click();
    cy.get('button[type="submit"]').contains('Logout').click();

    cy.url().should('include', '/login');
  });
});
