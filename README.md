# puppeteer-extra-plugin-solve-cloudflare

> A plugin for [puppeteer-extra](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra) that provides an automated cloudflare solution using the service [2CAPTCHA](https://2captcha.com/?from=18177101)

## Install

```bash
npm install puppeteer-extra-plugin-solve-cloudflare
```

If this is your first [puppeteer-extra](https://github.com/berstend/puppeteer-extra) plugin here's everything you need:

```bash
npm install puppeteer puppeteer-extra puppeteer-extra-plugin-stealth puppeteer-extra-plugin-solve-cloudflare
```

## Usage

```js
import puppeteer from "puppeteer-extra";
import solveCF from "puppeteer-extra-plugin-solve-cloudflare";
import stealth from "puppeteer-extra-plugin-stealth";
puppeteer.use(stealth());
puppeteer.use(
  solveCF({
    provider: {
      id: '2captcha',
      token: 'XXXXXXX' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡  
    }
  })
)
puppeteer.launch({ headless: "new" }).then(async browser => {
  const page = await browser.newPage()
  await page.goto("https://justlightnovels.com");
  await page.waitForSelector("#main",{timeout:70000}) // WAIT TARGET ELEMENT
  await page.screenshot({path:"target.png",fullPage:true});
  await browser.close()
})
```