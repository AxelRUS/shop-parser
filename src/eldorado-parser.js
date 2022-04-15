import _ from 'lodash';
import SiteParser from './site-parser.js';

const sleep = (timeout) =>
    new Promise((resolve) => setTimeout(resolve(), timeout));

export default class EldoradoParser extends SiteParser {
    async parsePage(url) {
        const pageUrl = new URL(url);
        await this.newPage();
        // await this._optimizeLoading();
        let i = 1;
        let result = [];
        let pageResult;
        await this.page.goto(pageUrl, {
            waitUntil: 'networkidle2',
        });
        do {
            // await sleep(5000);

            if (i > 1) {
                await this.page.waitForSelector('.wr', { timeout: 200 });
                await this.page.evaluate(
                    (i) =>
                        [...document.querySelectorAll('.wr a')]
                            .find((el) => el.textContent === `${i}`)
                            .click(),
                    i
                );
            }
            console.log(this.page.url());
            try {
                await this.page.waitForSelector('#listing-container', {
                    timeout: 10000,
                });
            } catch (e) {
                await this.page.screenshot({
                    path: `screenshot_${i}.png`,
                    fullPage: true,
                });
            }
            await this._scrollDown();
            pageResult = await Promise.all([
                this._parseTextValues('a.SF'),
                this._parseTextValues('span.WR'),
            ]);
            i += 1;
            result = result.concat(_.zip(...pageResult));
        } while (Math.max(...pageResult.map((el) => el.length)) === 36);
        // await this.page.screenshot({ path: 'screenshot.png', fullPage: true });
        return result;
    }
}
