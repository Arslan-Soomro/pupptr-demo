const pptr = require("puppeteer-core");
const fs = require("fs");

//If you want to use puppeteer you can change import here and chage dependency
//and don't forget to remove the executabelPath

const saveJs = (fileName, wrapperSelector, data, separator) => {
    
const toWrite = 
`//str is important to safely parse data into array into the output script

const ${fileName}StrData = '${data.join(separator)}';
const ${fileName}Data = ${fileName}StrData.split('${separator}');
const ${fileName}Wrapper = document.querySelector('${wrapperSelector}');
for(let i = 0; i < ${fileName}Data.length; i++){
    const el = document.createElement('img');
    el.src = ${fileName}Data[i];
    el.classList.add('img-item');
    ${fileName}Wrapper.appendChild(el);
}
`

fs.writeFile(`public/output/${fileName}.js`, toWrite, (err) => {
    if(err){
        throw err;
    }
    console.log('Data Saved Succesfully');
});
}
//Use infiniteScrap instead of scrapZara because this one only fetches the few images at top
const scrapZara = async () => {
  try {
    const url = 'https://www.zara.com/ww/en/search?searchTerm=sales&section=WOMAN';

    const browser = await pptr.launch({
      executablePath: "C:\\Program Files\\Chromium\\chrome.exe",
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );

    await page.goto(url);
    console.log("Page Loaded Succesfully");

    //await page.screenshot({ path: "StartZara.png" });

    let imgSrcs = await page.$$eval(
      "#main > article > div > div > div.search-products-view__search-results > section.product-grid > ul > li > a > div > div > div > img",
      (el) => {
        return el.map((x) => x.src);
      }
    );

    console.log("Scraped Images: " + imgSrcs.length);

    if(imgSrcs && imgSrcs.length > 0){
      //Filter Out Svg Imgs
      imgSrcs = imgSrcs.filter((src) => (!(src.includes('.svg')) && !(src.includes('transparent-background.png'))));

      console.log('Useful Images: ' + imgSrcs.length);
      saveJs("zara", "#imgs-wrapper", imgSrcs, ',');
    }

    await browser.close();
  } catch (err) {
    console.warn("Something Went Wrong, ", err.message);
  }
};

const scrapHm = async () => {
  try{
    const url = 'https://www2.hm.com/en_in/sale/women/view-all.html';

    const browser = await pptr.launch({
      executablePath: "C:\\Program Files\\Chromium\\chrome.exe",
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );

    await page.goto(url);
    console.log("Page Loaded Succesfully");

    //await page.screenshot({ path: "StartHm.png" });
    
    let imgSrcs = await page.$$eval(
      "#page-content > div > div:nth-child(2) > ul > li > article > div.image-container > a > img",
      (el) => {
        return el.map((x) => x.src);
      }
    );

    console.log("Scraped Images: " + imgSrcs.length);

    if(imgSrcs && imgSrcs.length > 0){
      //Filter Out Right Imgs
      imgSrcs = imgSrcs.filter((src) => src !== url);

      console.log('Useful Images: ' + imgSrcs.length);
      saveJs("hm", "#imgs-wrapper", imgSrcs, ' ');
    }

    await browser.close();

  }catch(err){
    console.warn('Something Went Wrong', err.message);
  }
}

function extractItems() {
    const extractedElements = document.querySelectorAll("#main > article > div > div > div.search-products-view__search-results > section.product-grid > ul > li > a > div > div > div > img");
    const items = [];
    for (let element of extractedElements) {
      items.push(element.src);
    }
    return items;
}

async function scrapeItems(
  page,
  extractItems,
  itemCount,
  scrollDelay = 800,
) {
  let items = [];
  try {
    let previousHeight;
    while (items.length < itemCount) {
      items = await page.evaluate(extractItems);
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
      await page.waitForTimeout(scrollDelay);
    }
  } catch(e) { }
  return items;
}

const infiniteScrap = async (noImgs) => {
  try {
    
    const url = 'https://www.zara.com/ww/en/search?searchTerm=sales&section=WOMAN';

    const browser = await pptr.launch({
      executablePath: "C:\\Program Files\\Chromium\\chrome.exe",
      headless: true,
    });

    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent(
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36"
    );

    await page.goto(url);
    console.log("Page Loaded Succesfully");

    //await page.screenshot({ path: "StartZara.png" });

    let imgSrcs = await scrapeItems(page, extractItems, noImgs);

    console.log("Scraped Images: " + imgSrcs.length);

    if(imgSrcs && imgSrcs.length > 0){
      //Filter Out Svg Imgs
      imgSrcs = imgSrcs.filter((src) => (!(src.includes('.svg')) && !(src.includes('transparent-background.png'))));

      console.log('Useful Images: ' + imgSrcs.length);
      saveJs("zara", "#imgs-wrapper", imgSrcs, ',');
    }

    await browser.close();
  } catch (err) {
    console.warn("Something Went Wrong, ", err.message);
  }
};

infiniteScrap(50);
scrapHm();