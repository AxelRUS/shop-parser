import _ from 'lodash';
import SiteParser from './site-parser.js';

export default class MvideoParser extends SiteParser {
    goods = {
        count: 0,
        goods: [],
        prices: [],
        statuses: [],
    };

    async parsePageFull(url) {
        await this.newPage();
        // await this._optimizeLoading();
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

    async parsePage(url) {
        const pageUrl = new URL(url);
        await this.newPage();
        // await this._optimizeLoading();
        await this.setInterceptors();
        // await this.page.goto(url, { waitUntil: 'networkidle2' });
        // await this._scrollDown();

        let pageNum = 1;
        do {
            if (pageNum > 1) {
                pageUrl.searchParams.set('page', pageNum);
            }
            // eslint-disable-next-line no-await-in-loop
            await this.page.goto(pageUrl, { waitUntil: 'networkidle2' });
            console.log(pageUrl.toString());
            pageNum += 1;
        } while (this.goods.count > this.goods.prices.length);

        console.log(
            this.goods.count,
            this.goods.prices.length,
            this.goods.goods.length,
            this.goods.statuses.length
        );
    }

    async setInterceptors() {
        await this.page.setRequestInterception(true);

        const getCount = async (response) => {
            const json = await response.json();
            this.goods.count = json?.body?.currentCategory?.count;
        };

        const appendGoods = async (response) => {
            const json = await response.json();
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
