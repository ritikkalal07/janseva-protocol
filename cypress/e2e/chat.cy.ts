describe("Chat flow", () => {
  beforeEach(() => {
    cy.visit("/chat");
    cy.get('main').should('be.visible');
    cy.wait(300);
  });

  it("loads the chat page and shows header", () => {
    cy.contains("AI Civic Assistant");
    cy.contains("Offline Library");
  });

  it("sends a user message and shows it in the conversation", () => {
    const message = "How do I file an RTI application?";
    cy.get("textarea[placeholder]").first().type(message, { force: true });
    cy.get('button[aria-label="Send message"]').click({ force: true });
    cy.contains(message);
  });

  it("can switch to Offline Library and shows free badge", () => {
    cy.get('[data-cy="offline-library-btn"]').click({ force: true });
    cy.contains('Use the offline civic knowledge library for free', { timeout: 5000 });
  });
});
