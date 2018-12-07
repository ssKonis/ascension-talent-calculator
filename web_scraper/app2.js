var fs = require('fs');
const jsdom = require("jsdom");

const cheerio = require('cheerio');



function Talent(max_rank) {
  this.data = [
    /*Rank*/
    /*Image*/
    /*id*/
  ]
  this.max_rank = max_rank;
}

// function TalentMap() {
//   this.classNum;
//   this.treeNum;
//   this.talents = [
//     {
//       data: [

//       ],
//       max_rank
//     }
//   ]
// }
var map = [];

function parseData(html, class_name) {
  var window = cheerio.load(fs.readFileSync('classPage/' + html)).html();

  const { JSDOM } = jsdom;
  const dom = new JSDOM(window);
  const $ = (require('jquery'))(dom.window);
  /*Select first table for druids*/

  let tables = $('.atc-editor-classtabbarcontent-content-wrapper-talenttree-table > tbody')

  $(tables).each(function (i) {
    /* For each row*/
    let table = $(tables[i]).children();
    for (let row = 0; row < table.length; row++) {
      let table_row = $(table[row]).children();
      /*For Each column, skip first column*/
      let row_length = table_row.length
      if ((class_name == 'paladin.html') && (i == 1)) {
        row_length = 5;
        console.log("Found paladin prot")
      }
      for (let col = 1; col < row_length; col++) {
        let table_col = $(table_row[col]).children();

        let iconExists = table_col.length; /* Length > than 1 if there is an icon */
        if (iconExists) {
          let image = $(table_col).find('img').attr('src')
          let id = $(table_col).find('.atc-editor-classtabbarcontent-content-wrapper-talenttree-table-talent-container-content-wrapper-talent-images-overlay-gray').attr('data-ascension-tooltip-id');
          let rank_range = $(table_col).find('.atc-editor-classtabbarcontent-content-wrapper-talenttree-table-talent-container-content-wrapper-talent-text-gray').html();
          let cur_rank = rank_range.charAt(0);
          let max_rank = parseInt(rank_range.charAt(2));
          let talent = new Talent(max_rank);

          for (let k = 0; k < max_rank; k++) {
            let data = {}
            data.id = parseInt(id) + k; /*This method does not always return correct ID*/
            data.rank = parseInt(cur_rank) + k + 1;
            data.image = image.split("/")[2];

            talent.data.push(data);
          }

          map.push(talent);

        }
        else {
          let talent = new Talent(1)
          map.push(talent);

        }

      }
    }
  })


}


var pages = ['druid.html', 'hunter.html', 'mage.html', 'paladin.html', 'priest.html', 'rogue.html', 'shaman.html', 'warlock.html', 'warrior.html'];
var count = 0;
pages.forEach(html => {

  parseData(html, pages[count]);
  count += 1;
});

// map.forEach(item => {
//   console.log(JSON.stringify(item.data, null, 2));
// });

fs.writeFile("./text.json", JSON.stringify(map), (err) => {
  if (err) {
    console.error(err);
    return;
  };
  console.log("File has been created");
})

