const curl = require("curl");
const jsdom = require("jsdom");
const url = "http://127.0.0.1:5500/web_scraper/Ascension%20Classless%20Realm.html#/talentsandabilities/editor/";



function parseData(html) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = (require('jquery'))(dom.window);
  let main = $('#root').html();
  console.log(main);




}

curl.get(url, null, (err, resp, body) => {
  if (resp.statusCode == 200) {
    parseData(body);
  }
  else {
    //some error handling
    console.log("error while fetching url");
  }
});