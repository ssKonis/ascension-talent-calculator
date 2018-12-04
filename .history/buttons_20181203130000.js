$(document).ready(function () { //check document is loaded

  //display modal on icon click
  $('#selected_class').on('click', function () {
    $('.modal').css('display', 'block');
    alert("clicked");
  })

  //close modal when cross is pressed
  $('.close').on('click', function () {
    $('.modal').css('display', 'none');
  })
});