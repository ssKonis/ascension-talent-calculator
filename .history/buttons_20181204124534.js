//Icon Blue Print
function Icon(name, element) {
  this.name = name;
  this.element = element;
  this.image = 'https://data.project-ascension.com/files/images/icons/classes/' + name + '.png';
  element.src = this.image;

}

$(document).ready(function () { //check document is loaded
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

  // Get placeholder divs
  let elements = $('.modal-content').children().toArray();

  let class_names = ['hunter', 'mage', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'];
  let Icons = [];
  for (let i = 0; i < class_names.length; i++) {
    let icon = new Icon(class_names[i], elements[i])
    Icons.push(icon);
  }
  console.log(Icons);
});