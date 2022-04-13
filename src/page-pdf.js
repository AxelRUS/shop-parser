import SiteParser from './site-parser.js';

export default class PagePdf extends SiteParser {
    async getPdf(url) {
        await this.newPage();
        await this.page.emulateMediaType('print');
        await this.page.goto(url, { waitUntil: 'networkidle2' });
        await this._scrollDown();
        const title = await this.page.title();
        const filename = title.replace(/[^ a-zA-Z0-9А-Яа-я]/g, '');
        const margins = '10px';
        await this.page.pdf({
            path: `${filename}.pdf`,
            // width: 1404,
            // height: 1872,
            format: 'a4',
            scale: 1,
            margin: {
                top: margins,
                left: margins,
                right: margins,
                bottom: margins,
            },
        });
    }
}
