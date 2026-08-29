import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
await page.goto('http://localhost:8081/components/Tree', { waitUntil: 'networkidle', timeout: 120000 });
await page.waitForTimeout(6000);
const info = await page.evaluate(() => {
  const box = [...document.querySelectorAll('div')].find(d => /height: 320px/.test(d.getAttribute('style')||''));
  const out = [];
  let el = box;
  for (let i = 0; i < 8 && el; i++) {
    const cs = getComputedStyle(el);
    out.push({
      up: i,
      w: el.clientWidth,
      role: el.getAttribute('role'),
      display: cs.display,
      flexDirection: cs.flexDirection,
      alignItems: cs.alignItems,
      alignSelf: cs.alignSelf,
      flex: cs.flex,
      width: cs.width,
      style: (el.getAttribute('style')||'').slice(0, 100),
    });
    el = el.parentElement;
  }
  return out;
});
console.log(JSON.stringify(info, null, 1));
await browser.close();
