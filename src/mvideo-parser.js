import _ from 'lodash';
import SiteParser from './site-parser.js';

export default class MvideoParser extends SiteParser {
    async parsePage(url) {
        await this.newPage();
        await this._optimizeLoading();
        await this.page.goto(url, { waitUntil: 'networkidle2' });
        await this._scrollDown();
        const result = await Promise.all([
            this._parseTextValues(
                'div.product-card__title-line-container .product-title__text'
            ),
            this._parseTextValues(
                'div.product-card__price-block-container .price__main-value'
            ),
        ]);
        await this.page.screenshot({ path: 'screenshot.png', fullPage: true });
        return _.zip(...result);
    }
}
