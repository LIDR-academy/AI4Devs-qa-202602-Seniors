import { type Locator, type Page } from '@playwright/test';

/**
 * Arrastra una tarjeta de candidato a la columna destino (react-beautiful-dnd).
 * Usa movimiento manual de ratón como estrategia principal; dragTo como fallback.
 */
export async function dragCandidateToPhase(
  page: Page,
  candidateCardTestId: string,
  targetPhaseColumnTestId: string,
): Promise<void> {
  const source = page.getByTestId(candidateCardTestId);
  const targetBody = page.getByTestId(`${targetPhaseColumnTestId}-body`);

  await source.scrollIntoViewIfNeeded();
  await targetBody.scrollIntoViewIfNeeded();

  try {
    await dragWithMouse(page, source, targetBody);
  } catch {
    const targetBox = await targetBody.boundingBox();
    const targetCenter = targetBox
      ? { x: targetBox.width / 2, y: 30 }
      : { x: 40, y: 30 };

    await source.dragTo(targetBody, {
      sourcePosition: { x: 15, y: 15 },
      targetPosition: targetCenter,
      timeout: 10_000,
    });
  }
}

async function dragWithMouse(page: Page, source: Locator, target: Locator): Promise<void> {
  const srcBox = await source.boundingBox();
  const tgtBox = await target.boundingBox();

  if (!srcBox || !tgtBox) {
    throw new Error('No se pudo obtener boundingBox para el drag manual');
  }

  const startX = srcBox.x + srcBox.width / 2;
  const startY = srcBox.y + srcBox.height / 2;

  const endX = tgtBox.x + tgtBox.width / 2;
  const endY = tgtBox.y + 30;

  const midX =
    tgtBox.x >= srcBox.x
      ? srcBox.x + srcBox.width + (tgtBox.x - (srcBox.x + srcBox.width)) / 2
      : tgtBox.x + tgtBox.width + (srcBox.x - (tgtBox.x + tgtBox.width)) / 2;
  const midY = startY + (endY - startY) / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 15, startY + 5, { steps: 3 });
  await page.mouse.move(midX, midY, { steps: 12 });
  await page.mouse.move(endX, endY, { steps: 25 });
  await page.mouse.up();
}
