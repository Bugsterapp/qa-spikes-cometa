// testSetup.ts
import { test as baseTest } from '@playwright/test';

const test = baseTest.extend({
  page: async ({ page }, use) => {
    const consoleLogs: string[] = [];

    // Hook global: captura los logs de consola
    page.on('console', (msg) => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });

    await use(page);

    // Al final del test, adjunta los logs de consola
    test.info().attach('Browser console logs', {
      body: consoleLogs.join('\n'),
      contentType: 'text/plain',
    });
  },
});

export { test };
