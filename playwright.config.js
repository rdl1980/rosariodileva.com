const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  // 1 retry: assorbe i flake di rete del runner CI (risorse esterne lente)
  retries: 1,
  reporter: [['list']],
  use: { headless: true },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
