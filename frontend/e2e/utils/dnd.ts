import type { Locator, Page } from '@playwright/test';

/**
 * Keyboard-based drag for react-beautiful-dnd.
 *
 * The library's keyboard sensor is the only reliable way to drive its
 * lifecycle from Playwright — native HTML5 drag events do not fire its
 * handlers. The sensor binds Space (lift / drop), Arrow keys (move), and
 * Escape (cancel) to the focused draggable's drag handle.
 */
const LIFT_SETTLE_MS = 400;
const STEP_MS = 400;

export async function dragCardAcrossColumns(
  page: Page,
  card: Locator,
  columnDelta: number,
): Promise<void> {
  await card.scrollIntoViewIfNeeded();
  await card.focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(LIFT_SETTLE_MS);

  if (columnDelta !== 0) {
    const key = columnDelta > 0 ? 'ArrowRight' : 'ArrowLeft';
    for (let i = 0; i < Math.abs(columnDelta); i++) {
      await page.keyboard.press(key);
      await page.waitForTimeout(STEP_MS);
    }
  }

  await page.keyboard.press('Space');
  await page.waitForTimeout(LIFT_SETTLE_MS);
}

export async function dropOnSameColumn(page: Page, card: Locator): Promise<void> {
  await dragCardAcrossColumns(page, card, 0);
}

export async function cancelDrag(page: Page, card: Locator): Promise<void> {
  await card.scrollIntoViewIfNeeded();
  await card.focus();
  await page.keyboard.press('Space');
  await page.waitForTimeout(LIFT_SETTLE_MS);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(LIFT_SETTLE_MS);
}

