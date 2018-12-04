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
  function Icon(element, ) {
    this.element = element;
    this.image = image;
  }
  // Get class Icons
  let elements = $('.modal-content').children().toArray();

  let druid_icon = $



  class_icons.forEach(icon => {
    icon.onclick = function () {
      modal.css('display', 'none')
      modal.isOpen = false;
      $('#classIcon').attr('src', 'https://data.project-ascension.com/files/images/icons/classes/hunter.png')
    }
  });
});