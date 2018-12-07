var map = []
var class_names = ['druid', 'hunter', 'mage', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'];

/* Get Locations from JSON FIle*/
function getMap() {
  /*Turn of asynch to load JSON*/
  $.ajaxSetup({
    async: false
  });

  /*Get locations*/
  $.getJSON("text.json", function (data) {
    data.forEach(element => {
      map.push(element);
    });
  })

  /*turn Async back on*/
  $.ajaxSetup({
    async: true
  });
}

//Talent Tree object
function Tree(class_name, element, index) {
  this.class_name = class_name
  this.element = element;
  this.image = 'https://wotlk.evowow.com/static/images/wow/talents/backgrounds/' + class_name + '_' + index + '.jpg'
  /*Update background image css*/
  $(this.element).css('background-image', 'url(' + this.image + ')');
}

//ClassIcon Blue Print
function ClassIcon(name, element, modalId) {
  this.name = name;
  this.element = element;
  this.image = 'https://data.project-ascension.com/files/images/icons/classes/' + name + '.png';
  element.src = this.image;
  element.name = name /*Image name*/

  element.onclick = function () {
    loadBackground(element.name); /*Load background images*/
    loadTalents(name);
    /*Close modal*/
    $('#' + modalId).toggle();

    $('#selectedClassIcon').attr('src', element.src)/*Change icon image*/
    selected_class = element.name;
  }


}

//Talent Blue Print
function Talent(id, element, nRanks) {
  this.id = id;
  this.element = element;
  // this.image = image_name
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



function loadTalents(selectedclass) {
  let n = 44; /* Number of grids per tree */

  let placeholder = class_names.indexOf(selectedclass) * n * 3;
  console.log(placeholder);
  for (let j = 0; j < 3; j++) {/*For each tree*/
    let selector = '#tree' + j
    $(selector).children().empty(); /*Clear previous talents*/
    let grids = $(selector).children().toArray();
    let p = placeholder + (j * n);
    for (let i = 0; i < n; i++) {
      if (map[i + p].data[0] != undefined) {
        let image_name = map[i + p].data[0].image;
        let imgElement = document.createElement("img");
        imgElement.src = 'https://data.project-ascension.com/files/images/icons/' + image_name;
        grids[i].appendChild(imgElement)
      }
    }
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

function Modal(modalId) {
  this.modal = $('#' + modalId);
  this.isOpen = false;
  this.open_button
  this.toggle = function () {
    if (this.modal.isOpen) { //Close Modal
      this.modal.css('display', 'none');
      this.modal.isOpen = false;
    }
    else { //Open
      this.modal.css('display', 'block');
      this.modal.isOpen = true;
    }
  }

  this.initIcons = function () {
    // Get placeholder divs
    let elements = $('.modal-content').children().toArray();

    let ClassIcons = [];
    /* Replace placeholder with appropriate class icons and give click functionality*/
    for (let i = 0; i < class_names.length; i++) {
      let icon = new ClassIcon(class_names[i], elements[i], modalId)
      ClassIcons.push(icon);
    }
  }

}

$(document).ready(function () { //check document is loaded

  /*Retrieve JSON File containing locations of each talent point */
  getMap();


  /* Init Modal and class Icons */
  let classModal = new Modal('modal');
  classModal.initIcons();

  //Toggle modal display on ClassIcon click
  $('#selectedClassIcon').on('click', function () {
    classModal.toggle()
  })





  /* Initialize Default Settings */
  let selected_class = 'druid';
  loadBackground(selected_class);
  loadTalents(selected_class);

});

