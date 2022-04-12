import puppeteer from 'puppeteer';

const config = {
    viewportHeight: 1280,
    viewportWidth: 1920,
    userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
};

const url = {
    mvideo: 'https://www.mvideo.ru/playstation-4327/ps5-igry-22780',
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

const labelParsingGame = 'Parsing games';
console.time(labelParsingGame);
const games = await page.evaluate(() => {
    return Array.from(
        document.querySelectorAll(
            'div.product-card__title-line-container .product-title__text'
        )
    ).map((item) => item.textContent.trim());
});
console.timeEnd(labelParsingGame);

console.info(games);
// await page.screenshot({ path: 'screenshot.png', fullPage: true });

await browser.close();
