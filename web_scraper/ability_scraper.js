var fs = require('fs');
const jsdom = require("jsdom");

const cheerio = require('cheerio');
const curl = require('curl');

var items = [];

function Ability(id, image, spec, class_name) {
  this.id = id;
  this.image = image;
  this.spec = spec;
  this.class_name = class_name;
}
var map = [];

function getRootID(html, class_name) {
  var window = cheerio.load(fs.readFileSync('classPage/' + html)).html();

  const { JSDOM } = jsdom;
  const dom = new JSDOM(window);
  const $ = (require('jquery'))(dom.window);

  let div = $('.atc-editor-classabilities-content-wrapper-abilities')
  let divs = $(div).children()

  for (let i = 0; i < divs.length; i++) { //for each spec
    let spec = $(divs[i]).first().text();
    let icons = $(divs[i]).children();

    for (let j = 1; j < icons.length; j++) { //each icon, skip first line 
      let icon = $(icons[j]).find('.atc-editor-classabilities-content-ability-container-content-wrapper-images')
      let image = $(icons[j]).find('img').attr('src').split('/')[2];
      let id = $(icons[j]).find('.atc-editor-classabilities-content-ability-container-content-wrapper-images-panel--not-trained').attr('data-ascension-tooltip-id')
      let ability = new Ability(id, image, spec, class_name.split('.')[0])
      map.push(ability);
      console.log(JSON.stringify(ability, null, 2));

    }

  }



}


getAbilities = function () {
  var pages = ['druid.html', 'hunter.html', 'mage.html', 'paladin.html', 'priest.html', 'rogue.html', 'shaman.html', 'warlock.html', 'warrior.html'];
  var count = 0;
  pages.forEach(html => {
    getRootID(html, pages[count]);
    count += 1;
  });

  fs.writeFile("./abilities.json", JSON.stringify(map), (err) => {
    if (err) {
      console.error(err);
      return;
    };
    console.log("File has been created");
  })

}

getAbilities()




