const puppeteer = require('puppeteer');

exports.createPDF = async (htmlContent) => {
    // Launch Puppeteer in headless mode
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
    });

    const page = await browser.newPage();

    try {
        // Set the HTML content
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        await browser.close();
        throw new Error('Error generating PDF: ' + error.message);
    }
};
