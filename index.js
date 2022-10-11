const puppeteer = require('puppeteer');
const fs = require('fs');
const xlsx = require('xlsx');

const cookiesFilePath = 'cookies.json';
const date = new Date();
const audience = [];

// code general data 
const generalData = {
  loginStep:{
    userData: {
      // add your credencial
      userLogin: 'user login',
      userPassword: 'user password'
    },
    selectorData: {
      emailSelector:'#EmailPage-EmailField',
      emailButton: '.spectrum-Button.spectrum-Button--cta.SpinnerButton.SpinnerButton--right',
      passwordSelector:'#PasswordPage-PasswordField',
      passwordButton: '.spectrum-Button.spectrum-Button--cta'
    }
  },
  audienceStep:{
    iframeSelector: '#exc > div > div > div.spectrum-ShellContainer-content.can-takeover.has-appContainer > div.exc-core-sandbox.exc-core-sandbox-common.appContainer iframe',
    audienceNameSelector:'#segmentInfoW > dl > dd:nth-child(6)',
    audienceNumberSelector:'#segmentUniquesW > div.segment-metrics-column-group > section.segment-metrics-column.total-uniques > div.segment-metrics-column__1day-metric--large'
  }
}

console.log('Starting crawler...')

async function crawler(url) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--start-maximized',
      '--disable-features=site-per-process'
    ],
    userDataDir: './user_data'
  })
  
  // doc: https://www.npmjs.com/package/puppeteer
  const page = await browser.newPage();
  const navigationPromise = page.waitForNavigation();
  await page.goto(url);
  await navigationPromise;

  /* 
  ** START -> AUTOMATIC LOGIN <-- START **
  */
  if(await page.$(generalData.loginStep.selectorData.emailSelector)) {
    // email step
    await page.waitForSelector(generalData.loginStep.selectorData.emailSelector);
    await page.click(generalData.loginStep.selectorData.emailSelector);
    await navigationPromise;
    await page.type(generalData.loginStep.selectorData.emailSelector, generalData.loginStep.userData.userLogin);
    await page.waitForTimeout(500)
    await page.click(generalData.loginStep.selectorData.emailButton);
    console.log('Email Step')
    // password step
    await page.waitForSelector(generalData.loginStep.selectorData.passwordSelector);
    await page.click(generalData.loginStep.selectorData.passwordSelector);
    await navigationPromise;
    await page.type(generalData.loginStep.selectorData.passwordSelector, generalData.loginStep.userData.userPassword);
    await page.waitForSelector(generalData.loginStep.selectorData.passwordButton);
    await page.waitForTimeout(500)
    await page.click(generalData.loginStep.selectorData.passwordButton)
    console.log('Password Step')

    const cookiesObject = await page.cookies()
    // Write cookies to temp file to be used in other profile pages
    fs.writeFile(cookiesFilePath, JSON.stringify(cookiesObject),
     function(err) { 
      if (err) {
      console.log('The file could not be written.', err)
      }
      console.log('Session has been successfully saved')
    })
  }
  /* 
  ** END -> AUTOMATIC LOGIN <-- END **
  */
  
  // check cookies
  const previousSession = fs.existsSync(cookiesFilePath)
  if (previousSession) {
    // If file exist load the cookies
    const cookiesString = fs.readFileSync(cookiesFilePath);
    const parsedCookies = JSON.parse(cookiesString);
    if (parsedCookies.length !== 0) {
      for (let cookie of parsedCookies) {
        await page.setCookie(cookie)
      }
      console.log('Session has been loaded in the browser')
    }
  }
  
  await page.waitForSelector(generalData.audienceStep.iframeSelector);
    
  await navigationPromise
  await page.waitForTimeout(2000)
  const frame = page.frames().find(frame => frame.url().includes('https://audience-manager.adobe.com'));
  const content = await frame;
  let audienceNumber = await content.$eval(generalData.audienceStep.audienceNumberSelector, label=> label.textContent)
  let audienceName = await content.$eval(generalData.audienceStep.audienceNameSelector, label=> label.textContent)
  let audienceId = url.split('/').slice(-1)[0]
  let currentDay = date.toLocaleDateString()

  // save in audience array
  audience.push([currentDay,audienceName,audienceId, audienceNumber]);
  console.log(`Collected audience: ${audienceName}`)

  await browser.close();
}

// write xlxs
function writeFiles() {
  const wb = xlsx.utils.book_new();
  const ws = xlsx.utils.aoa_to_sheet(audience)
  xlsx.utils.book_append_sheet(wb,ws)
  xlsx.writeFile(wb,'audience.xlsx')
  console.log('YOUR EXCEL WAS GENERATED SUCCESSFULLY!!')
}

async function main() {
  await crawler('audience url');
  /* add new urls bellow:
  await crawler('other urls')
  .
  .
  .
  */
  await writeFiles();
}

main()



