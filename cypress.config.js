const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'https://forrit-cms-autocd-core-api.azurewebsites.net',
    token: '{insert token here}'
  },
});
