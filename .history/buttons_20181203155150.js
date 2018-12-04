
$(document).ready(function () { //check document is loaded
  let modal = $('.modal');




  //display modal on icon click
  $('#selected_class').on('click', function () {
    modal.css('display', 'block');
  })

  //close modal when cross is pressed
  $('.close').on('click', function () {
    $('.modal').css('display', 'none');
  })
});