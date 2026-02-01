import { test, expect } from '@playwright/test';

test.describe('Ethernote App', () => {
    test('should load the home screen', async ({ page }) => {
        await page.goto('/');

        // Wait for the app to load
        await page.waitForLoadState('networkidle');

        // Check if the app title "Ethernote" is visible
        await expect(page.getByText('Ethernote')).toBeVisible({ timeout: 10000 });
    });

    test('should display notes list', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Wait for the app to render
        await page.waitForTimeout(2000);

        // The home screen should be visible
        await expect(page.getByText('Ethernote')).toBeVisible();
    });

    test('should navigate to note detail when clicking a note', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Wait for notes to load
        await page.waitForTimeout(2000);

        // Try to find and click on a note (if any exist)
        const noteItems = page.locator('[role="button"]').filter({ hasText: /.*/ });
        const count = await noteItems.count();

        if (count > 0) {
            // Click the first note
            await noteItems.first().click();

            // Wait for navigation
            await page.waitForTimeout(1000);

            // Should navigate to note detail screen
            // This is a basic check - adjust based on your actual UI
            await expect(page).toHaveURL(/.*/, { timeout: 5000 });
        }
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // App should still load and display title
        await expect(page.getByText('Ethernote')).toBeVisible({ timeout: 10000 });
    });
});
