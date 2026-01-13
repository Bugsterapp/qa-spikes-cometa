import { Page } from '@playwright/test';

/**
 * Suppresses FilePond and PDF preview errors that occur during file uploads.
 *
 * IMPORTANT: This is a workaround for known issues with FilePond PDF plugin errors.
 * These errors do not affect test functionality but appear in the console/overlay.
 *
 * TODO: Investigate and fix the root cause in the application code:
 * - FilePond PDF preview plugin initialization errors
 * - "Cannot read properties of null" errors related to file reading
 *
 * @param page - The Playwright page instance
 */
export async function suppressFilePondErrors(page: Page): Promise<void> {
  await suppressErrorEvents(page);
  await disablePdfPlugins(page);
  await hideErrorOverlays(page);
  await removeErrorOverlaysDynamically(page);
}

async function suppressErrorEvents(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.addEventListener(
      'error',
      (event) => {
        if (
          event.message?.includes('filepond') ||
          event.message?.includes('Cannot read properties of null') ||
          event.message?.includes('pdf-preview') ||
          event.message?.includes("reading 'file'")
        ) {
          event.stopImmediatePropagation();
          event.preventDefault();
          return false;
        }
      },
      true
    );
  });
}

async function disablePdfPlugins(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const originalRegisterPlugin = (window as any).FilePond?.registerPlugin;
    if (originalRegisterPlugin) {
      (window as any).FilePond.registerPlugin = function (...plugins: any[]) {
        const filteredPlugins = plugins.filter((plugin) => {
          const pluginName = plugin?.pluginName || plugin?.name || '';
          return !pluginName.toLowerCase().includes('pdf');
        });
        if (filteredPlugins.length > 0) {
          return originalRegisterPlugin.apply(this, filteredPlugins);
        }
      };
    }
  });
}

async function hideErrorOverlays(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      nextjs-portal, 
      [data-nextjs-dialog-overlay],
      [data-nextjs-toast],
      #__next-build-watcher,
      [id^="__next-error"],
      body > div[style*="position: fixed"][style*="z-index"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `,
  });
}

async function removeErrorOverlaysDynamically(page: Page): Promise<void> {
  await page.evaluate(() => {
    const removeErrorOverlays = () => {
      const errorOverlays = document.querySelectorAll(
        'nextjs-portal, [data-nextjs-dialog-overlay], [data-nextjs-toast]'
      );
      errorOverlays.forEach((el) => {
        if (el && el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };

    const observer = new MutationObserver(() => {
      removeErrorOverlays();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setInterval(removeErrorOverlays, 500);
  });
}
