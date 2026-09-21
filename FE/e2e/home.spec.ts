import { expect, test } from '@playwright/test';

test('home page exposes core IELTS/Aptis practice CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Master IELTS & Aptis/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Explore Question Bank/i })).toBeVisible();
});
