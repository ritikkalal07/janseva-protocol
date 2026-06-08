describe("Chat flow", () => {
  beforeEach(() => {
    cy.visit("/chat");
  });

  it("loads the chat page and shows header", () => {
    cy.contains("AI Civic Assistant");
    cy.contains("Offline Library");
  });

  it("sends a user message and shows it in the conversation", () => {
    const message = "How do I file an RTI application?";
    cy.get("textarea[placeholder]").type(message);
    cy.get('button[aria-label="Send message"]').click();
    cy.contains(message);
  });

  it("can switch to Offline Library and shows free badge", () => {
    cy.contains("Offline Library").click();
    cy.contains("Free — unlimited");
  });
});
