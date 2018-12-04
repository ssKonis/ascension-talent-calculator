$(document).ready(function () { //check document is loaded
  $('#selected_class').on('click', function () {
    let modal = $('.modal');
    console.log(modal);
    modal.style.display = "block";
  })
});