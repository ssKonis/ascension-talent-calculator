$(document).ready(function () { //check document is loaded

  //Talent Tree object
  function Tree(class_name, element, index) {
    this.class_name = class_name
    this.element = element;
    this.image = 'https://wotlk.evowow.com/static/images/wow/talents/backgrounds/' + class_name + '_' + index + '.jpg'
    /*Update background image css*/
    $(this.element).css('background-image', 'url(' + this.image + ')');
  }

  //Icon Blue Print
  function Icon(name, element) {
    this.name = name;
    this.element = element;
    this.image = 'https://data.project-ascension.com/files/images/icons/classes/' + name + '.png';
    element.src = this.image;
    element.name = name /*Image name*/

    element.onclick = function () {
      loadBackground(element.name); /*Load background images*/
      loadTalents();
      /*Close modal*/
      modal.css('display', 'none');
      modal.isOpen = false;

      $('#selectedClassIcon').attr('src', element.src)/*Change icon image*/
      selected_class = element.name;
    }
  }

  // Get placeholder divs
  let elements = $('.modal-content').children().toArray();

  let class_names = ['druid', 'hunter', 'mage', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'];
  let Icons = [];
  for (let i = 0; i < class_names.length; i++) {
    let icon = new Icon(class_names[i], elements[i])
    Icons.push(icon);
  }


  let modal = $('.modal');
  modal.isOpen = false;

  //Toggle modal display on icon click
  $('#selectedClassIcon').on('click', function () {
    if (modal.isOpen) { //Close Modal
      modal.css('display', 'none');
      modal.isOpen = false;
    }
    else { //Open
      modal.css('display', 'block');
      modal.isOpen = true;
    }
  })

  /*Load background*/
  function loadBackground(class_name) {
    //Select div that holds talent trees and populate with relevant data
    let trees = $('.trees').children();
    let icons = []
    for (let i = 0; i < 3; i++) {
      let tree = new Tree(class_name, trees[i], i + 1)
      icons.push(tree);
    }
  }

  function loadTalents() {
    for (let j = 1; j < 4; j++) {
      let selector = '#tree' + j
      $(selector).children().empty(); /*Clear previous talents*/
      let n = 44; /* Number of grids per tree */
      let grids = $(selector).children().toArray();
      for (let i = 0; i < n; i++) {
        /*Example fluff content*/
        if (i == (6) || i == (11) || i == (19) || i == (27) || i == (42)) {
          let imgElement = document.createElement("img")
          imgElement.src = "/images/talents/genesis.jpg"
          grids[i].appendChild(imgElement)
        }
      }
    }


  }

  /* Initialize Default Settings */
  let selected_class = 'druid';
  loadBackground(selected_class);
  loadTalents();

});

