import _ from 'lodash';
import SiteParser from './site-parser.js';

export default class MvideoParser extends SiteParser {
    products = {
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
        pageUrl.searchParams.set('showCount', 72);
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
        } while (this.products.count > this.products.prices.length);

        console.log(
            this.products.count,
            this.products.prices.length,
            this.products.goods.length,
            this.products.statuses.length
        );

        const parsedCount = Math.min(
            this.products.prices.length,
            this.products.goods.length,
            this.products.statuses.length
        );
        if (this.products.count !== parsedCount) {
            return Promise.reject(
                Error(
                    `Количество полученных данных ${parsedCount} не соответствует количеству товаров ${this.products.count}`
                )
            );
        }
        for (let i = 0; i < this.products.goods.length; i++) {
            const { productId } = this.products.goods[i];
            const price = this.products.prices.find(
                (el) => el.productId === productId
            );
            const status = this.products.statuses.find(
                (el) => el.productId === productId
            );
            Object.assign(this.products.goods[i], price, status);
        }
        return this.products.goods;
    }

    async setInterceptors() {
        await this.page.setRequestInterception(true);

        const getCount = async (response) => {
            const json = await response.json();
            this.products.count = json?.body?.currentCategory?.count;
        };

        const appendGoods = async (response) => {
            const json = await response.json();
            this.products.goods = this.products.goods.concat(
                json.body.products
            );
        };

        const appendStatuses = async (response) => {
            const json = await response.json();
            this.products.statuses = this.products.statuses.concat(
                json.body.statuses
            );
        };

        const appendPrices = async (response) => {
            const json = await response.json();
            this.products.prices = this.products.prices.concat(
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
