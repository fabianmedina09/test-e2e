describe("Select product and go to cart", () => {
  beforeEach(() => {
    cy.intercept("https://www.macys.com", (req) => {
        req.headers["accept"] = "application/json, text/plain, */*";
        req.headers["user-agent"] = "axios/0.27.2";
      });
    cy.visit("https://www.macys.com", {
    });
    cy.wait(5000);
    cy.get(".closeButton").click();
  });
  it("Select products", () => {
    // solve access error in cy.visit('https://www.macys.com/')

    cy.get("#globalMastheadSearchTerm").type("shoes{enter}");
    cy.get(".productThumbnail").first().click();
    cy.get(".add-to-bag-button").click();
    cy.get(".bag").click();
    cy.get(".bag-item").should("be.visible");
  });
});
