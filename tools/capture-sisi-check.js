const puppeteer = require('puppeteer-core');
(async()=>{
 const browser=await puppeteer.launch({executablePath:'/usr/bin/chromium-browser',args:['--no-sandbox','--disable-dev-shm-usage'],headless:'new'});
 const page=await browser.newPage();
 await page.setViewport({width:1280,height:720,deviceScaleFactor:1});
 await page.goto('http://127.0.0.1:3137/space-play.html?lesson=1',{waitUntil:'networkidle2'});
 await page.addStyleTag({content:`
   body{overflow:hidden!important;background:linear-gradient(135deg,#eef7ff,#fff7ed)!important;}
   .hero{display:none!important}.shell{width:1240px!important;margin:0 auto!important}.play-layout{margin-top:18px!important;gap:18px!important;grid-template-columns:minmax(0,1fr) 390px!important;align-items:stretch!important}.game-card,.side-card{box-shadow:0 18px 45px rgba(15,23,42,.14)!important}.platform-home-link,#rfw-launcher{display:none!important}.fact,.space-guide{display:none!important}.grid{max-width:520px!important;margin:0 auto!important}.side-card{max-height:690px!important;overflow:hidden!important}.nav-lessons{display:none!important}
 `});
 await page.screenshot({path:'marketing/sisi-check.png'});
 await browser.close();
})();