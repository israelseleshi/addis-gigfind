describe('Gig Management', () => {
  it('should allow a client to post a new gig and verify its visibility', () => {
    // Log in as client
    cy.visit('/login');
    cy.get('input[name="email"]').type('israelseleshi09@gmail.com');
    cy.get('input[name="password"]').type('1234567890');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.url().should('include', '/freelancer/dashboard');

    // Post a new gig
    cy.visit('/client/gigs/create');
    const gigTitle = 'Konso Traditional Attire Photoshoot';
    const gigDescription = 'We are looking for a skilled photographer to capture our new line of Konso traditional clothing. The photoshoot will take place outdoors to highlight the vibrant colors and intricate designs of the garments.';
    cy.get('input[name="title"]').type(gigTitle);
    cy.get('button[role="combobox"]').first().click();
    cy.get('div[role="option"]').contains('Design').click();
    cy.get('textarea[name="description"]').type(gigDescription);
    cy.get('input[type="number"][placeholder="e.g., 5000"]').type('15000');
    cy.get('button[role="combobox"]').last().click();
    cy.get('div[role="option"]').contains('Bole').click();
    cy.get('button[type="submit"]').contains('Post Gig').click();

    // Verify on client's 'My Gigs' page
    cy.url().should('include', '/client/my-gigs');
    cy.get('button').contains('Refresh').click();
    cy.contains(gigTitle);

    // Verify on public search page
    cy.visit('/search');
    cy.contains(gigTitle);

    // Log out as client
    cy.visit('/client/dashboard');
    cy.get('header button').click();
    cy.get('button[type="submit"]').contains('Logout').click();
    cy.url().should('include', '/login');

    // Log in as freelancer
    cy.get('input[name="email"]').type('israeltheodros09@gmail.com');
    cy.get('input[name="password"]').type('12345678');
    cy.get('button[type="submit"]').contains('Sign In').click();
    cy.url().should('include', '/client/dashboard');

    // Verify on freelancer's 'Find Work' page
    cy.visit('/freelancer/find-work');
    cy.contains(gigTitle);
  });
});
