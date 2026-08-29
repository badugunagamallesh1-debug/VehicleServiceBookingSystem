const path = require('path');
const puppeteer = require('puppeteer-core');

async function generatePDF() {
  console.log('Launching Chrome to render 43-page PDF report...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const htmlPath = path.join(__dirname, 'Project_Report.html');
  const pdfPath = path.join(__dirname, 'Vehicle_Service_Booking_System_Report.pdf');

  console.log(`Loading HTML from: ${htmlPath}`);
  await page.goto(`file:///${htmlPath.replace(/\\/g, '/')}`, {
    waitUntil: 'networkidle0',
    timeout: 60000
  });

  console.log('Generating PDF file...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '0px',
      right: '0px',
      bottom: '0px',
      left: '0px'
    }
  });

  await browser.close();
  console.log(`PDF successfully created at: ${pdfPath}`);
}

generatePDF().catch((err) => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
