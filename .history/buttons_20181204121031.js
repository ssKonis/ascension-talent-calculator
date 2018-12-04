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
  function Icon(element, ) {
    this.element = element;
  }

  // Get Class icons and make them clickable
  let class_icons = $('.modal-content').children().toArray();

  class_icons.forEach(icon => {
    icon.onclick = function () {
      modal.css('display', 'none')
      modal.isOpen = false;
      $('#classIcon').attr('src', 'https://data.project-ascension.com/files/images/icons/classes/hunter.png')
    }
  });
});