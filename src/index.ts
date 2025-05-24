import { PuppeteerExtraPlugin } from "puppeteer-extra-plugin";
import { Browser, Frame, Page } from "puppeteer";
import * as types from "./types";
import Captcha from "2captcha-ts-js";
/**
 * A puppeteer-extra plugin real mouse click.
 * @noInheritDoc
 */
export class PuppeteerExtraPluginCF extends PuppeteerExtraPlugin {
  attachScript = `console.clear = () => console.log('Console was cleared')
const i = setInterval(() => {
    if (window.turnstile) {
        clearInterval(i)
        window.turnstile.render = (a, b) => {
            let params = {
                sitekey: b.sitekey,
                pageurl: window.location.href,
                data: b.cData,
                pagedata: b.chlPageData,
                action: b.action,
                userAgent: navigator.userAgent,
                json: 1
            }
            console.log('intercepted-params:' + JSON.stringify(params))
            window.cfCallback = b.callback
            return
        }
    }
}, 50)`;
  constructor(opts: Partial<types.PluginOptions>) {
    super(opts);
    this.debug("Initialized", this.opts);
  }

  get name() {
    return "recaptcha";
  }
  get opts(): types.PluginOptions {
    return super.opts as any;
  }
  log(message: any) {
    if (this.opts.debug) {
      console.log(message);
    }
  }
  async solveCF(page: Page | Frame) {
    const provider = this.opts.provider;
    if (
      !provider ||
      !provider.token ||
      (provider.token && provider.token === "XXXXXXX")
    ) {
      throw new Error("Please provide a solution provider to the plugin.");
    }
    const solver = new Captcha.Solver(provider.token);
    await page.evaluateOnNewDocument(this.attachScript);
    page.on("console", async (msg) => {
      const txt = msg.text();
      if (txt.includes("intercepted-params:")) {
        const params = JSON.parse(txt.replace("intercepted-params:", ""));
        this.log(params);
        try {
          console.log(`Solving the captcha...`);
          const res = await solver.cloudflareTurnstile(params);
          this.log(`Solved the captcha ${res.id}`);
          this.log(res);
          await page.evaluate((token) => {
            cfCallback(token);
          }, res.data);
        } catch (e) {
          this.log("ERROR");
          this.log(e);
        }
      } else {
        return;
      }
    });
  }
  private _addCustomMethods(prop: Page | Frame) {
    this.solveCF(prop);
  }

  async onPageCreated(page: Page) {
    this.debug("onPageCreated", page.url());
    // Make sure we can run our content script
    await page.setBypassCSP(true);

    // Add custom page methods
    this._addCustomMethods(page);

    // Add custom methods to potential frames as well
    page.on("frameattached", (frame) => {
      if (!frame) return;
      this._addCustomMethods(frame);
    });
  }

  /** Add additions to already existing pages and frames */
  async onBrowser(browser: Browser) {
    const pages = await browser.pages();
    for (const page of pages) {
      this._addCustomMethods(page);
      for (const frame of page.mainFrame().childFrames()) {
        this._addCustomMethods(frame);
      }
    }
  }
}

/** Default export, PuppeteerExtraPluginCF  */
const defaultExport = (options?: Partial<types.PluginOptions>) => {
  return new PuppeteerExtraPluginCF(options || {});
};

export default defaultExport;
