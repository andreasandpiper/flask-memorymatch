function Cow() {
  this.cowState = $(".methane").attr('src', '/static/images/cow.png');
  this.neonCow = function () {
    $(".methane").attr('src', '/static/images/neoncow.png');
  }
  this.methaneGasCow = function () {
    $("img.methaneGas").removeClass('hidden');
    setTimeout(function () {
      $("img.methaneGas").addClass('hidden');
    }, 5000);
  }
}