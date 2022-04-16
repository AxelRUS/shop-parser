import puppeteer from 'puppeteer';

const config = {
    viewportHeight: 1280,
    viewportWidth: 1920,
    userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36',
    lazyLoad: true,
};

const opts = {
    headless: true,
    defaultViewport: {
        width: config.viewportWidth,
        height: config.viewportHeight,
    },
};

export default class SiteParser {
    async launch(options = {}) {
        this.browser = await puppeteer.launch({ ...options, ...opts });
        await this.newPage();
    }

    async newPage() {
        this.page = await this.browser.newPage();
        await this.page.setUserAgent(config.userAgent);
    }

    async _optimizeLoading() {
        await this.page.setRequestInterception(true);
        this.page.on('request', (request) => {
            if (
                ['image', 'stylesheet', 'font'].indexOf(
                    request.resourceType()
                ) !== -1
            ) {
                request.abort();
            } else {
                request.continue();
            }
        });
    }

    _parseTextValues(selector) {
        return this.page.evaluate((_selector) => {
            // eslint-disable-next-line no-undef
            return Array.from(document.querySelectorAll(_selector)).map(
                (item) => item.textContent.trim()
            );
        }, selector);
    }

    async _scrollDown() {
        const getMaxScroll = () =>
            this.page.evaluate(function () {
                return Promise.resolve(
                    Math.max(
                        document.body.scrollHeight,
                        document.body.offsetHeight,
                        document.documentElement.clientHeight,
                        document.documentElement.scrollHeight,
                        document.documentElement.offsetHeight
                    ) - window.innerHeight
                );
            });
        const scrollDown = async (i) => {
            await this.page
                .evaluate(
                    (i, viewportHeight) =>
                        Promise.resolve(window.scrollTo(0, i * viewportHeight)),
                    i,
                    config.viewportHeight
                )
                .then(() =>
                    this.page.waitForNavigation({
                        waitUntil: 'networkidle2',
                        timeout: 200,
                    })
                )
                .catch(() => {});
        };

        const getFullScrolls = () =>
            getMaxScroll().then((maxScrolls) =>
                Math.ceil(maxScrolls / config.viewportHeight)
            );

        let fullScrolls = await getFullScrolls();
        let i = 1;
        while (i <= fullScrolls) {
            // eslint-disable-next-line no-await-in-loop
            await scrollDown(i);
            if (i === fullScrolls) {
                // eslint-disable-next-line no-await-in-loop
                fullScrolls = await getFullScrolls();
                console.log(`change fullscrolls to ${fullScrolls}`);
            }
            i += 1;
            console.log(`fullscrolls ${i}/${fullScrolls}`);
        }
        await scrollDown(0);
    }

    gotoUrl(url) {
        return this.page.goto(url, {
            waitUntil: 'networkidle2',
        });
    }

    waitForSelector(selector, opt) {
        return this.page.waitForSelector(selector, opt).catch(() =>
            this.page.screenshot({
                path: `screenshot_sel_${selector}.png`,
            })
        );
    }

    async free() {
        if (this.browser) await this.browser.close();
    }
}
