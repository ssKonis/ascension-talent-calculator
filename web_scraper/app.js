var fs = require('fs');
const jsdom = require("jsdom");
var events = require('events');

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


// var pages = ['druid.html', 'hunter.html', 'mage.html', 'paladin.html', 'priest.html', 'rogue.html', 'shaman.html', 'warlock.html', 'warrior.html'];
// var count = 0;
// pages.forEach(html => {
//   getRootID(html, pages[count]);
//   count += 1;
// });

getRootID('warrior.html', 'warrior.html')
// map.forEach(item => {
//   console.log(JSON.stringify(item.data, null, 2));
// });


function getNextID(html, page_num) {
  const { JSDOM } = jsdom;
  const dom = new JSDOM(html);
  const $ = (require('jquery'))(dom.window);
  let table = $('tbody').first().html()
  $(table).each(function (row) {
    if (row % 2 == 0) { /*For some reason an extra row is being pulled, only selects actual ids*/
      let id = parseInt($(this).children().eq(0).text())
      let name = $(this).children().eq(2).children().eq(0).text()
      let rank = parseInt($(this).children().eq(2).children().eq(2).text().slice(5, 6))

      // console.log("Name: ", name, "Rank: ", rank, "Id: ", id)

      let item = {
        name: name,
        id: id,
        rank: rank
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

function req(url, page_num) {
  curl.get(url, null, (err, resp, body) => {
    if (resp.statusCode == 200) {
      console.log('Page: ', page_num)
      getNextID(body, page_num);
      // console.log("==================================================")
    }
    else {
      //some error handling
      console.log("error while fetching url");
    }
  });
}



let home = 'https://data.project-ascension.com/spells?class=8&page=1&type=Talent';

curl.get(home, null, (err, resp, body) => {
  if (resp.statusCode == 200) {
    let n_pages = getNumPages(body);
    for (let i = 0; i < n_pages; i++) {
      let url = 'https://data.project-ascension.com/spells?class=8&page=' + i + '&type=Talent';
      req(url, i + 1);

    }
  }
  else {
    //some error handling
    console.log("error while fetching url");
  }

});


// fs.writeFile("./test.json", JSON.stringify(items), (err) => {
//   if (err) {
//     console.error(err);
//     return;
//   };
//   console.log("File has been created");
// })

setTimeout(function () {
  items.forEach(item => {
    console.log(JSON.stringify(item, null, 2));
  });
  map.forEach(item => {
    console.log(JSON.stringify(item, null, 2));
  });
}, 10000)

