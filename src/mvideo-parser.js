import _ from 'lodash';
import SiteParser from './site-parser.js';

export default class MvideoParser extends SiteParser {
    goods = {
        count: 0,
        goods: [],
        prices: [],
        statuses: [],
    };

    async parsePage(url) {
        await this.newPage();
        // await this._optimizeLoading();
        await this.setInterceptors();
        await this.page.goto(url, { waitUntil: 'networkidle2' });
        // await this._scrollDown();
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

    async setInterceptors() {
        await this.page.setRequestInterception(true);

        const getCount = async (response) => {
            const json = await response.json();
            this.goods.count = json?.body?.currentCategory?.count;
        };

        const appendGoods = async (response) => {
            const json = await response.json();
            console.log(json);
            this.goods.goods = this.goods.goods.concat(json.body.products);
        };

        const appendStatuses = async (response) => {
            const json = await response.json();
            this.goods.statuses = this.goods.statuses.concat(
                json.body.statuses
            );
        };

        const appendPrices = async (response) => {
            const json = await response.json();
            console.log(json);
            this.goods.prices = this.goods.prices.concat(
                json?.body?.materialPrices
            );
        };

        this.page.on('request', (request) => {
            request.continue();
        });

        this.page.on('response', (response) => {
            const url = new URL(response.url());
            const path = url.origin + url.pathname;
            switch (path) {
                case 'https://www.mvideo.ru/bff/products/listing':
                    getCount(response);
                    break;
                case 'https://www.mvideo.ru/bff/product-details/list':
                    appendGoods(response);
                    break;
                case 'https://www.mvideo.ru/bff/products/statuses':
                    appendStatuses(response);
                    break;
                case 'https://www.mvideo.ru/bff/products/prices':
                    appendPrices(response);
                    break;
            }
        });
    }
}
