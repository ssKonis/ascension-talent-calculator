const curl = require("curl");
const jsdom = require("jsdom");
const url = "http://127.0.0.1:5500/Ascension%20Classless%20Realm.html#/talentsandabilities/editor/";

var Talent = function (row, col, max_rank) {
  this.location = {
    row: row,
    col: col
  };
  this.data = [{
    /*Rank*/
    /*Image*/
    /*id*/
  }]
  this.max_rank = max_rank;
}

var map = [];
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
        let rank_range = $(table_col).find('.atc-editor-classtabbarcontent-content-wrapper-talenttree-table-talent-container-content-wrapper-talent-text-gray').html();
        let cur_rank = rank_range.charAt(0);
        let max_rank = rank_range.charAt(2);
        let talent = new Talent((row + 1), col, max_rank);

        for (let k = 0; k < max_rank; k++) {
          let data = {}
          data.id = parseInt(id) + k;
          data.rank = parseInt(cur_rank) + k;
          data.image = image.split("/")[2];
          talent.data.push(data);
        }

        map.push(talent);

      }
      else {
        let talent = new Talent((row + 1), col, 1)
        map.push(talent);

      }

    }
  }
}
const fs = require('fs')

curl.get(url, null, (err, resp, body) => {
  if (resp.statusCode == 200) {
    parseData(body);

    map.forEach(item => {
      console.log(JSON.stringify(item.data, null, 2));

    });

    fs.writeFile("./text.json", JSON.stringify(map), (err) => {
      if (err) {
        console.error(err);
        return;
      };
      console.log("File has been created");
    })
  }
  else {
    //some error handling
    console.log("error while fetching url");
  }
});

