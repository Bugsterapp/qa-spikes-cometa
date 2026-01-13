/**
 * Unified Retry Utilities for E2E Tests
 * Consolidates multiple retry functions into a single, configurable utility.
 */

import type { Page, Locator } from '@playwright/test';

/**
 * Configuration options for retry operations
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  delayBetweenRetries?: number;
  /** Whether to reload the page between retries */
  reloadOnRetry?: boolean;
  /** Custom error message prefix */
  errorMessage?: string;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 5,
  delayBetweenRetries: 1000,
  reloadOnRetry: false,
  errorMessage: 'Retry operation failed',
};

/**
 * Generic retry function that executes an async operation with retries
 */
export async function retry<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < config.maxRetries - 1) {
        await delay(config.delayBetweenRetries);
      }
    }
  }

  throw new Error(`${config.errorMessage} after ${config.maxRetries} attempts: ${lastError?.message}`);
}

/**
 * Wait for an element to become visible with retries
 */
export async function waitForElementVisible(
  page: Page,
  locator: Locator,
  options: RetryOptions = {}
): Promise<boolean> {
  const config = { ...DEFAULT_OPTIONS, maxRetries: 5, delayBetweenRetries: 2000, ...options };

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      await page.waitForTimeout(config.delayBetweenRetries);
      if (await locator.isVisible()) {
        return true;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(`Retry ${attempt + 1}/${config.maxRetries}: Element not visible yet`);
    }

    // Reload on certain retries to avoid too many reloads
    if (config.reloadOnRetry && attempt < config.maxRetries - 1 && attempt % 2 === 0) {
      await page.reload();
      await page.waitForLoadState('networkidle');
    }
  }

  throw new Error(
    `${config.errorMessage || 'Element not found visible'} after ${config.maxRetries} attempts: ${locator}`
  );
}

/**
 * Wait for an element to become hidden with retries
 */
export async function waitForElementHidden(page: Page, locator: Locator, options: RetryOptions = {}): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, delayBetweenRetries: 500, ...options };

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      if (!(await locator.isVisible())) {
        return;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Element did not hide after ${attempt + 1} attempts: ${error.message}`);
      }
      throw error;
    }
    await page.waitForTimeout(config.delayBetweenRetries);
  }
}

/**
 * Click an element until an expected element becomes visible
 */
export async function clickUntilVisible(
  page: Page,
  clickElement: Locator,
  expectedElement: Locator,
  options: RetryOptions = {}
): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, delayBetweenRetries: 5000, ...options };

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      if (await expectedElement.isVisible()) {
        return;
      }
      await clickElement.click();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error after ${attempt + 1} attempts: ${error.message}`);
      }
      throw error;
    }
    await page.waitForTimeout(config.delayBetweenRetries);
  }
}

/**
 * Retry with scroll until element text matches expected value
 */
export async function waitForTextWithScroll(
  page: Page,
  locator: string,
  expectedValue: string,
  options: RetryOptions = {}
): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, maxRetries: 10, ...options };

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      const element = page.locator(locator).first();
      await element.scrollIntoViewIfNeeded();
      const textContent = await element.textContent();

      if (textContent === expectedValue) {
        return;
      }
    } catch (error) {
      throw new Error(`Could not find text "${expectedValue}" after ${config.maxRetries} attempts: ${error}`);
    }

    await page.waitForTimeout(config.delayBetweenRetries);
    await page.reload();
    await page.waitForLoadState();
  }
}

/**
 * Scroll page until element becomes visible
 */
export async function scrollToElement(
  page: Page,
  locator: Locator,
  options: { maxAttempts?: number; scrollAmount?: number } = {}
): Promise<void> {
  const { maxAttempts = 30, scrollAmount = 10000 } = options;

  for (let count = 0; count < maxAttempts; count++) {
    if (await locator.isVisible()) {
      return;
    }
    await page.mouse.wheel(0, scrollAmount);
    await page.waitForTimeout(1000);
  }

  throw new Error('Element not found after scrolling');
}

/**
 * Simple delay utility
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with custom condition check
 */
export async function retryUntil(condition: () => Promise<boolean>, options: RetryOptions = {}): Promise<void> {
  const config = { ...DEFAULT_OPTIONS, ...options };

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    if (await condition()) {
      return;
    }
    await delay(config.delayBetweenRetries);
  }

  throw new Error(`${config.errorMessage} - Condition not met after ${config.maxRetries} attempts`);
}
