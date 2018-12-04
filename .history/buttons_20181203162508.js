
$(document).ready(function () { //check document is loaded
  let modal = $('.modal');
  modal.isOpen = false;

  let class_icons = $('#modal-content');

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
});