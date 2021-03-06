/* import PagePdf from './src/page-pdf.js';

const pagePdf = new PagePdf();
try {
    await pagePdf.launch();
    await pagePdf.getPdf('https://habr.com/ru/post/537764/');
} finally {
    await pagePdf.free();
} */

import { promises as fsPromises } from 'fs';
import dayjs from 'dayjs';
import MvideoParser from './src/mvideo-parser.js';
import EldoradoParser from './src/eldorado-parser.js';

// const siteParser = new MvideoParser();
const siteParser = new EldoradoParser();
try {
    await siteParser.launch(
        {
            // userDataDir: './userData/udEldorado',
            devtools: true,
        },
        {
            harFile: `eldorado_${dayjs().format(
                'YYYY-MM-DD_HH-mm-ss.SSS'
            )}.har`,
        }
    );
    // const results = await siteParser.parsePage(
    //     'https://www.eldorado.ru/c/vse-igry/b/SONY/'
    // );
    // await fsPromises.writeFile('eldorado.json', JSON.stringify(results));
    // console.log(results, results?.length);
    await siteParser.page.setRequestInterception(true);
    siteParser.page.on('request', (request) => request.continue());
    await siteParser.gotoUrl('https://www.eldorado.ru/c/vse-igry/b/SONY/');
    // await siteParser.page.waitForTimeout(6000 * 1000);
    await siteParser.waitForSelector('.nr', { timeout: 5000 });
    let city = await siteParser.getCity();
    console.log(`Город: ${city}`);
    await siteParser.setCity('Набер');
    city = await siteParser.getCity();
    console.log(`Город: ${city}`);
    // await siteParser.setCity('Казань');
    // city = await siteParser.getCity();
    // console.log(city);
} finally {
    await siteParser.free();
}

/*
import puppeteer from 'puppeteer';
import _ from 'lodash';

const config = {
    viewportHeight: 1280,
    viewportWidth: 1920,
    userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
    lazyLoad: true,
};

const url = {
    mvideo: 'https://www.mvideo.ru/playstation-4327/ps5-igry-22780?showCount=72',
};

const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: {
        width: config.viewportWidth,
        height: config.viewportHeight,
    },
});

const labelOpenBrowserAndPage = 'Open browser && goto page';
console.time(labelOpenBrowserAndPage);
const page = await browser.newPage();
await page.setUserAgent(config.userAgent);
await page.goto(url.mvideo, { waitUntil: 'networkidle2' });
console.timeEnd(labelOpenBrowserAndPage);

await page.setRequestInterception(true);
page.on('request', (request) => {
    if (
        ['image', 'stylesheet', 'font', 'script'].indexOf(
            request.resourceType()
        ) !== -1
    ) {
        request.abort();
    } else {
        request.continue();
    }
});

const result = {};

const labelParsingGame = 'Parsing games';
console.time(labelParsingGame);

const parseTextValues = (selector) =>
    // eslint-disable-next-line no-shadow
    page.evaluate((selector) => {
        return Array.from(document.querySelectorAll(selector)).map((item) =>
            item.textContent.trim()
        );
    }, selector);

// const goodTitles = page.evaluate(() => {
//     return Array.from(
//         document.querySelectorAll(
//             'div.product-card__title-line-container .product-title__text'
//         )
//     ).map((item) => item.textContent.trim());
// });
// const goodPrices = page.evaluate(() => {
//     return Array.from(
//         document.querySelectorAll(
//             'div.product-card__price-block-container .price__main-value'
//         )
//     ).map((item) => item.textContent.trim());
// });

if (config.lazyLoad) {
    const maxScroll = await page
        .evaluate(function () {
            return Promise.resolve(
                Math.max(
                    document.body.scrollHeight,
                    document.body.offsetHeight,
                    document.documentElement.clientHeight,
                    document.documentElement.scrollHeight,
                    document.documentElement.offsetHeight
                ) - window.innerHeight
            );
        })
        .catch(function () {
            log(
                'BAD',
                'Lazy load failed due to an error while getting the scroll height.',
                1
            );
        });

    const fullScrolls = Math.floor(maxScroll / config.viewportHeight); // how many times full scroll needs to be done
    const lastScroll = maxScroll % config.viewportHeight; // amount left to get to the bottom of the page after doing the full scrolls

    // do full scrolls if there is any
    for (let i = 1; i <= fullScrolls; i++) {
        await page
            .evaluate(
                function (i, viewportHeight) {
                    return Promise.resolve(
                        window.scrollTo(0, i * viewportHeight)
                    );
                },
                i,
                config.viewportHeight
            )
            .catch(function () {
                result.status = 'BAD';
                result.message =
                    'Promise rejected while scrolling for lazy load images.';
            });

        await page
            .waitForNavigation({
                waitUntil: 'networkidle',
                networkIdleTimeout: 200,
            })
            .catch(function () {
                result.status = 'BAD';
                result.message =
                    'Promise rejected while waiting for navigation 1';
            });
    }

    // do last scroll if there is any
    if (lastScroll > 0) {
        await page
            .evaluate(function (maxScroll) {
                return Promise.resolve(window.scrollTo(0, maxScroll + 25));
            }, maxScroll)
            .catch(function () {
                result.status = 'BAD';
                result.message =
                    'Promise rejected while last scrolling for lazy load images.';
            });
    }

    await page
        .waitForNavigation({ waitUntil: 'networkidle' })
        .catch(function (error) {
            result.status = 'BAD';
            result.message = 'Promise rejected while waiting for navigation 2';
        });
}

const parsedResult = await Promise.all([
    parseTextValues(
        'div.product-card__title-line-container .product-title__text'
    ),
    parseTextValues(
        'div.product-card__price-block-container .price__main-value'
    ),
]);

console.timeEnd(labelParsingGame);

console.info(_.zip(...parsedResult));
// await page.screenshot({ path: 'screenshot.png', fullPage: true });

await browser.close();
*/
