// tools/screenshot.js
//
// Cattura i 12 screenshot per la relazione d'esame.
// Richiede server Synesthesia attivo su http://localhost:3000.
// Eseguire: node tools/screenshot.js

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT_DIR = path.resolve('docs/screenshots');
const VIEWPORT = { width: 1280, height: 800 };

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

async function login(page, username, password = 'password') {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.fill('form[action="/auth/login"] input[name="username"]', username);
    await page.fill('form[action="/auth/login"] input[name="password"]', password);
    await Promise.all([
        page.waitForURL(/\/($|feed|profile)/, { timeout: 10000 }),
        page.click('form[action="/auth/login"] button[type="submit"]'),
    ]);
}

async function logout(page) {
    // Submit logout form via JS (no user click needed)
    await page.evaluate(async () => {
        const res = await fetch('/auth/logout', { method: 'POST' });
        return res.ok;
    });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
}

async function snap(page, filename) {
    const out = path.join(OUT_DIR, filename);
    await page.screenshot({ path: out, fullPage: true });
    const stat = await fs.stat(out);
    console.log(`  ✓ ${filename} (${(stat.size / 1024).toFixed(0)} KB)`);
}

async function register(page, username, email) {
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.fill('form[action="/auth/register"] input[name="username"]', username);
    await page.fill('form[action="/auth/register"] input[name="email"]', email);
    await page.fill('form[action="/auth/register"] input[name="password"]', 'password123');
    await page.fill('form[action="/auth/register"] input[name="password2"]', 'password123');
    await page.click('form[action="/auth/register"] button[type="submit"]');
    await page.waitForURL(/\/(login|register)/, { timeout: 10000 });
}

async function submitOnboarding(page) {
    // Compila tutte le domande scegliendo sempre la prima opzione
    const radios = await page.$$eval(
        'form[action="/onboarding"] input[type="radio"]',
        (inputs) => {
            const byName = {};
            for (const r of inputs) {
                if (!byName[r.name]) byName[r.name] = r.value;
            }
            return byName;
        }
    );
    for (const [name, value] of Object.entries(radios)) {
        await page.check(`form[action="/onboarding"] input[name="${name}"][value="${value}"]`);
    }
    await Promise.all([
        page.waitForURL(/\/profile\//, { timeout: 15000 }),
        page.click('form[action="/onboarding"] button[type="submit"]'),
    ]);
}

async function main() {
    await ensureDir(OUT_DIR);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    console.log('Cattura 12 screenshot...\n');

    // 1. Home guest
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await snap(page, '01-home-guest.png');

    // 2. Register page
    await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', 'demo_user');
    await page.fill('input[name="email"]', 'demo@test.it');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="password2"]', 'password123');
    await snap(page, '02-register.png');

    // 3. Register + login + onboarding
    const uniqueUser = `demo_${Date.now()}`;
    await register(page, uniqueUser, `${uniqueUser}@test.it`);
    await login(page, uniqueUser, 'password123');
    await page.goto(`${BASE}/onboarding`, { waitUntil: 'networkidle' });
    await snap(page, '03-onboarding.png');

    // 4. Submit onboarding → profile own
    await submitOnboarding(page);
    await page.waitForLoadState('networkidle');
    await snap(page, '04-profile-own.png');

    // 5. Feed
    await page.goto(`${BASE}/feed`, { waitUntil: 'networkidle' });
    await snap(page, '05-feed.png');

    // 6. Challenge list
    await page.goto(`${BASE}/challenges`, { waitUntil: 'networkidle' });
    await snap(page, '06-challenge-list.png');

    // 7. Challenge detail
    await page.goto(`${BASE}/challenges/1`, { waitUntil: 'networkidle' });
    await snap(page, '07-challenge-detail.png');

    // 8. Upload (need creator role → login creative_soul)
    await logout(page);
    await login(page, 'creative_soul');
    await page.goto(`${BASE}/upload`, { waitUntil: 'networkidle' });
    await snap(page, '08-upload.png');

    // 9. Entry detail
    await page.goto(`${BASE}/entries/1`, { waitUntil: 'networkidle' });
    // wait for image to load
    await page.waitForTimeout(1500);
    await snap(page, '09-entry-detail.png');

    // 10. Search with query
    await page.goto(`${BASE}/search`, { waitUntil: 'networkidle' });
    await page.fill('input[name="query"]', 'tramonto');
    await page.click('button[type="submit"]').catch(() => {});
    await page.waitForTimeout(1000);
    await snap(page, '10-search-results.png');

    // 11. Creator dashboard
    await page.goto(`${BASE}/creator/dashboard`, { waitUntil: 'networkidle' });
    await snap(page, '11-creator-dashboard.png');

    // 12. Admin moderation
    await logout(page);
    await login(page, 'adminuser');
    await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
    await snap(page, '12-admin-moderation.png');

    await browser.close();
    console.log('\nDone. 12 screenshots in docs/screenshots/');
}

main().catch((err) => {
    console.error('ERROR:', err);
    process.exit(1);
});
