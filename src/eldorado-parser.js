import _ from 'lodash';
import SiteParser from './site-parser.js';

const sleep = (timeout) =>
    new Promise((resolve) => setTimeout(resolve, timeout));

export default class EldoradoParser extends SiteParser {
    async parsePage(url) {
        // await this._optimizeLoading();
        let i = 1;
        let result = [];
        let pageResult;
        await this.page.goto(url, {
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
            pageResult = await this.page.evaluate(() => {
                return Array.from(
                    document.querySelectorAll('#listing-container li.JF')
                ).map((el) => {
                    // ['a.SF', 'span.WR', 'span.wR .QH'].map((sel) =>
                    //     el.querySelector(sel)?.textContent?.trim()
                    // )
                    const productSelectors = {
                        id: '.QF',
                        title: 'a.SF',
                        price: 'span.WR',
                        bonus: 'span.uR .QH',
                        bonusAdditional: 'span.wR .QH',
                        availability: '.BN',
                    };

                    // eslint-disable-next-line no-shadow
                    const result = {};
                    for (const [key, value] of Object.entries(
                        productSelectors
                    )) {
                        result[key] = el
                            .querySelector(value)
                            ?.textContent?.trim();
                    }
                    return result;
                });
            });
            i += 1;
            result = result.concat(pageResult);
        } while (pageResult.length === 36);
        // await this.page.screenshot({ path: 'screenshot.png', fullPage: true });
        return result;
    }
}
