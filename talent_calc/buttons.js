

$(document).ready(function () { //check document is loaded

  /* Get Locations from JSON FIle*/
  var items = []
  /*Turn of asynch to load JSON*/
  $.ajaxSetup({
    async: false
  });

  /*Get locations*/
  $.getJSON("talent_locations_map.json", function (data) {
    data.forEach(element => {
      items.push(element);

    });
  })

  /*turn Async back on*/
  $.ajaxSetup({
    async: true
  });

  console.log(items);

  //Talent Tree object
  function Tree(class_name, element, index) {
    this.class_name = class_name
    this.element = element;
    this.image = 'https://wotlk.evowow.com/static/images/wow/talents/backgrounds/' + class_name + '_' + index + '.jpg'
    /*Update background image css*/
    $(this.element).css('background-image', 'url(' + this.image + ')');
  }

  //ClassIcon Blue Print
  function ClassIcon(name, element) {
    this.name = name;
    this.element = element;
    this.image = 'https://data.project-ascension.com/files/images/icons/classes/' + name + '.png';
    element.src = this.image;
    element.name = name /*Image name*/

    element.onclick = function () {
      loadBackground(element.name); /*Load background images*/
      loadTalents();
      /*Close modal*/
      toggleModal();

      $('#selectedClassIcon').attr('src', element.src)/*Change icon image*/
      selected_class = element.name;
    }
  }

  //Talent Blue Print
  function Talent(id, name, element, image_name, nRanks) {
    this.id = id;
    this.name = name;
    this.element = element;
    this.image = 'https://data.project-ascension.com/files/images/icons/' + image_name;
    this.tooltip = "Example Text";
    this.nRanks = nRanks;

    element.onmousedown = function (event) {
      if (event.which == 1) {
        /* Add point on left click and remove gray filter*/
        $(this).css('filter', 'none')
      }
      if (event.which == 3) {
        /* Remove point on right click and add gray filter */
        $(this).css('filter', 'grayscale(100)')

      }
    }
    /* On mouse over show tooltip */
    element.onmouseover = function () {

    }
  }

  // Get placeholder divs
  let elements = $('.modal-content').children().toArray();

  let class_names = ['druid', 'hunter', 'mage', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'];
  let ClassIcons = [];
  for (let i = 0; i < class_names.length; i++) {
    let icon = new ClassIcon(class_names[i], elements[i])
    ClassIcons.push(icon);
  }

  /* Modal */
  let modal = $('.modal');
  modal.isOpen = false;

  //Toggle modal display on ClassIcon click
  $('#selectedClassIcon').on('click', function () {
    toggleModal()
  })

  function toggleModal() {
    if (modal.isOpen) { //Close Modal
      modal.css('display', 'none');
      modal.isOpen = false;
    }
    else { //Open
      modal.css('display', 'block');
      modal.isOpen = true;
    }
  }


  /*Load background*/
  function loadBackground(class_name) {
    //Select div that holds talent trees and populate with relevant data
    let trees = $('.trees').children();
    let class_icons = []
    for (let i = 0; i < 3; i++) {
      let tree = new Tree(class_name, trees[i], i + 1)
      class_icons.push(tree);
    }
  }

  function loadTalents() {
    for (let j = 1; j < 4; j++) {/*For each tree*/
      let selector = '#tree' + j
      $(selector).children().empty(); /*Clear previous talents*/
      let n = 44; /* Number of grids per tree */
      let grids = $(selector).children().toArray();
      for (let i = 0; i < n; i++) {
        /*Example fluff content*/
        if (i == (6) || i == (11) || i == (19) || i == (27) || i == (42)) {
          let imgElement = document.createElement("img")
          imgElement.src = "/images/talents/genesis.jpg"
          let talent = new Talent(5, 'poo', imgElement, 5);
          grids[i].appendChild(talent.element)
        }
      }
    }
  }

  /* Initialize Default Settings */
  let selected_class = 'druid';
  loadBackground(selected_class);
  loadTalents();

});

