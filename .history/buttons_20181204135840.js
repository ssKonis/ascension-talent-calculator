$(document).ready(function () { //check document is loaded

  let selected_icon = 'druid';

  //Talent Tree object
  function Tree(class_name, element, index) {
    this.class_name = class_name
    this.element = element;
    this.image = 'https://wotlk.evowow.com/static/images/wow/talents/backgrounds/' + class_name + '_' + index + '.jpg'
    $(this.element).css('background-image', 'url(' + this.image + ')');
  }

  //Icon Blue Print
  function Icon(name, element) {
    this.name = name;
    this.element = element;
    this.image = 'https://data.project-ascension.com/files/images/icons/classes/' + name + '.png';
    element.src = this.image;
    element.onclick = function () {
      modal.css('display', 'none');
      modal.isOpen = false;
    }
    this.active = false;
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
  $('#selected_class').on('click', function () {
    if (modal.isOpen) { //Close Modal
      modal.css('display', 'none');
      modal.isOpen = false;
    }
    else { //Open
      modal.css('display', 'block');
      modal.isOpen = true;
    }
  })
  let y = []
  function loadTrees(selected_class) {
    //Select div that holds talent trees and populate with relevant data
    let trees = $('.trees').children();
    for (let i = 1; i < 4; i++) {
      let x = new Tree(selected_class, trees[i], i)
      y.push(x);
    }
    console.log(y);
  }

  loadTrees('druid');
});