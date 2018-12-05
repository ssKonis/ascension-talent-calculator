const curl = require("curl");
const jsdom = require("jsdom");
const url = "http://127.0.0.1:5500/web_scraper/Ascension%20Classless%20Realm.html#/talentsandabilities/editor/";



function parseData(html) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = (require('jquery'))(dom.window);

  /*Select first table for druids*/
  let table = $('.atc-editor-classtabbarcontent-content-wrapper-talenttree-table > tbody').first().children();

  /* For each row*/
  for (let row = 0; row < table.length; row++) {
    let table_row = $(table[row]).children();
    /*For Each column, skip first column*/
    for (let col = 1; col < table_row.length; col++) {
      let table_col = $(table_row[col]).children();

      let iconExists = table_col.length; /* Length > than 1 if there is an icon */
      if (iconExists) {
        let image = $(table_col).find('img').attr('src')
        let id = $(table_col).find('.atc-editor-classtabbarcontent-content-wrapper-talenttree-table-talent-container-content-wrapper-talent-images-overlay-gray').attr('data-ascension-tooltip-id');
        console.log("id = ", id, "image = ", image);
      }
      else {
        console.log("Empty")

      }

    }
  }
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