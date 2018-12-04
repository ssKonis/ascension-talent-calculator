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

  //Icon Blue Print
  function Icon(name, element, image) {
    this.name = name;
    this.element = element;
    this.image = 'https://data.project-ascension.com/files/images/icons/classes/' + '.png';
  }
  // Get class Icons
  let elements = $('.modal-content').children().toArray();

  let icons = []



  elements.forEach(element => {
    element.onclick = function () {
      modal.css('display', 'none')
      modal.isOpen = false;
      $('#classIcon').attr('src', 'https://data.project-ascension.com/files/images/icons/classes/hunter.png')
    }
  });
});