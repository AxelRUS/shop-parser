import _ from 'lodash';
import SiteParser from './site-parser.js';

const sleep = (timeout) =>
    new Promise((resolve) => setTimeout(resolve, timeout));

export default class EldoradoParser extends SiteParser {
    async parsePage(url) {
        const pageUrl = new URL(url);
        await this.newPage();
        // await this._optimizeLoading();
        let i = 1;
        let result = [];
        let pageResult;
        do {
            if (i > 1) pageUrl.searchParams.set('page', i);
            console.log(pageUrl.toString());
            await this.page.setExtraHTTPHeaders({
                referer: 'https://www.google.com',
            });
            await this.page.goto(pageUrl, {
                waitUntil: 'networkidle2',
            });
            // await sleep(5000);
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
        } while (Math.max(...pageResult.map((el) => el.length)) === 36);
        result = result.concat(pageResult);
        // await this.page.screenshot({ path: 'screenshot.png', fullPage: true });
        return _.zip(...result);
    }
}
