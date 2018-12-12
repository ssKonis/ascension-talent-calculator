var fs = require('fs');
const jsdom = require("jsdom");

const cheerio = require('cheerio');
const curl = require('curl');

var items = [];

function Talent(max_rank) {
  this.data = [
    /*Rank*/
    /*Image*/
    /*id*/
  ]
  this.max_rank = max_rank;
}
var map = [];

function getRootID(html, class_name) {
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
        // console.log("Found paladin prot")
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
          talent.class_name = class_name.split('.')[0]

          for (let k = 0; k < 1; k++) {
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
  getRootID(html, pages[count]);
  count += 1;
});

// getRootID('warrior.html', 'warrior.html')
// map.forEach(item => {
//   console.log(JSON.stringify(item.data, null, 2));
// });


function getNextID(html, class_id) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = (require('jquery'))(dom.window);
  let table = $('tbody').first().html();

  let class_name = pages[class_id].split('.')[0]
  $(table).each(function (row) {
    if (row % 2 == 0) { /*For some reason an extra row is being pulled, only selects actual ids*/
      let id = parseInt($(this).children().eq(0).text())
      let name = $(this).children().eq(2).children().eq(0).text()
      let rank = parseInt($(this).children().eq(2).children().eq(2).text().slice(5, 6))

      // console.log("Name: ", name, "Rank: ", rank, "Id: ", id)

      let item = {
        name: name,
        id: id,
        rank: rank,
        class_name: class_name
      }
      items.push(item);
    }

  })


};

function getNumPages(html) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = (require('jquery'))(dom.window);

  let table = $('tbody').first().html()

  return $('.pagination-link').last().text()

}

function req(url, page_num, class_id) {
  curl.get(url, null, (err, resp, body) => {
    if (resp.statusCode == 200) {
      console.log('Page: ', page_num)
      getNextID(body, class_id);
      // console.log("==================================================")
    }
    else {
      //some error handling
      console.log("error while fetching url");
    }
  });
}



for (let j = 1; j < 9; j++) {
  let home = 'https://data.project-ascension.com/spells?class=' + j + '&page=1&type=Talent';

  curl.get(home, null, (err, resp, body) => {
    if (resp.statusCode == 200) {
      let n_pages = getNumPages(body);
      for (let i = 0; i < n_pages; i++) {
        let url = 'https://data.project-ascension.com/spells?class=' + j + '&page=' + i + '&type=Talent';
        req(url, i + 1, j);

      }
    }
    else {
      //some error handling
      console.log("error while fetching url");
    }

  });
}








var superMap = map.slice()
// Used on set timeout to avoid missing data not being fully recieved
setTimeout(function () {

  for (let j = 0; j < map.length; j++) { //each item in map
    if (map[j].data[0] != undefined) {
      for (let i = 0; i < items.length; i++) {// each item in items
        if (map[j].data[0].id == items[i].id) {
          superMap[j].name = items[i].name;
          for (let k = 0; k < items.length; k++) { //check each item again to find sibling ranks
            /*Makes sure that the correct refernce is selected*/
            if ((superMap[j].name == items[k].name) && (items[k].rank != 1) && (map[j].class_name == items[k].class_name)) {
              //add new data entry for each rank
              let data = {}
              data.id = items[k].id;
              data.rank = items[k].rank;
              superMap[j].data.push(data);
            }
          }
        }
      }
    }
  }

  //TODO remove duplicate objects from supermap
  superMap.forEach(item => {
    console.log(JSON.stringify(item, null, 2));

  })

  // fs.writeFile("./test.json", JSON.stringify(superMap), (err) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   };
  //   console.log("File has been created");
  // })
}, 30000)

