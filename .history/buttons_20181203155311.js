
$(document).ready(function () { //check document is loaded
  let modal = $('.modal');
  modal.isOpen = false;




  //display modal on icon click
  $('#selected_class').on('click', function () {
    if (modal.isOpen) {
      modal.css('display', 'block');
    }
    else {
      modal.css('display', 'none');
    }
  })

  //close modal when cross is pressed
  $('.close').on('click', function () {
    $('.modal').css('display', 'none');
  })
});