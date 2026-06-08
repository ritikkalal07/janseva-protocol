// Minimal Cypress support file to satisfy default expectations
// Prevent uncaught exceptions from failing tests in CI-like environment
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
