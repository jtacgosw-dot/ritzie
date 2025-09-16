import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Theme System E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/demo/dual-mode-test.html');
    await page.waitForLoadState('networkidle');
  });

  test('bubble mode renders with Palantr theme', async ({ page }) => {
    await page.waitForSelector('[data-testid="ritzie-bubble"]', { timeout: 10000 });
    
    const bubble = page.locator('[data-testid="ritzie-bubble"]');
    await expect(bubble).toBeVisible();
    
    await bubble.click();
    
    const chatPanel = page.locator('[data-testid="ritzie-chat-panel"]');
    await expect(chatPanel).toBeVisible();
    
    const panelBg = await chatPanel.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    expect(panelBg).toBeTruthy();
  });

  test('full-page mode renders correctly', async ({ page }) => {
    await page.click('button:has-text("Full-Page Mode")');
    
    await page.waitForTimeout(500);
    
    const pageContainer = page.locator('#ritzie-chat');
    await expect(pageContainer).toBeVisible();
    
    const chatInterface = pageContainer.locator('[data-testid="ritzie-chat-interface"]');
    await expect(chatInterface).toBeVisible();
  });

  test('theme mode switching works', async ({ page }) => {
    await page.evaluate(() => {
      (window as any).RITZIE.api.setThemeMode('dark');
    });
    
    await page.waitForTimeout(200);
    
    const body = page.locator('body');
    const darkMode = await body.evaluate(el => 
      getComputedStyle(el).getPropertyValue('--rtz-bg')
    );
    expect(darkMode).toContain('#0B0F14');
  });

  test('reduced motion is respected', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.click('[data-testid="ritzie-bubble"]');
    
    const chatPanel = page.locator('[data-testid="ritzie-chat-panel"]');
    const transition = await chatPanel.evaluate(el => 
      getComputedStyle(el).transitionDuration
    );
    expect(transition).toBe('0s');
  });

  test('accessibility compliance', async ({ page }) => {
    await page.click('[data-testid="ritzie-bubble"]');
    await page.waitForSelector('[data-testid="ritzie-chat-panel"]');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withRules(['color-contrast', 'focus-visible', 'keyboard-navigation'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('skip to input shortcut works', async ({ page }) => {
    await page.click('[data-testid="ritzie-bubble"]');
    
    await page.keyboard.press('Alt+/');
    
    const input = page.locator('[data-testid="ritzie-message-input"]');
    await expect(input).toBeFocused();
  });

  test('message interaction works with theme', async ({ page }) => {
    await page.click('[data-testid="ritzie-bubble"]');
    
    const input = page.locator('[data-testid="ritzie-message-input"]');
    await input.fill('Hello, testing theme system!');
    await page.click('[data-testid="ritzie-send-button"]');
    
    const userMessage = page.locator('[data-testid="ritzie-user-message"]').last();
    await expect(userMessage).toBeVisible();
    await expect(userMessage).toContainText('Hello, testing theme system!');
    
    const messageBg = await userMessage.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    expect(messageBg).toBeTruthy();
  });

  test('server-driven config loads correctly', async ({ page }) => {
    const configResponse = await page.waitForResponse(
      response => response.url().includes('/v1/embed/config')
    );
    
    expect(configResponse.status()).toBe(200);
    
    const config = await configResponse.json();
    expect(config.theme).toBeDefined();
    expect(config.themeId).toBe('palantr');
    expect(config.layoutMode).toBeDefined();
  });
});
