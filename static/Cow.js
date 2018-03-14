function Cow() {
  this.cowState = $(".methane").attr('src', '/static/images/cow.png');
  this.activateFarting = false; 
  this.fartQueue = []; 

  this.neonCow = function () {
    $(".methane").attr('src', '/static/images/neoncow.png');
  }
  this.methaneGasCow = function () {
    var cowDomElem = $(".methaneGas")
    cowDomElem.removeClass('hidden');
    if(this.activateFarting){

      this.fartQueue.push('gas brewing')
    } else {

      this.activateFarting = true;
      setTimeout(function () {
        $("img.methaneGas").addClass('hidden');
        cow.activateFarting = false;
        var nextAnimation = cow.fartQueue.pop();
        if(nextAnimation){
          cow.methaneGasCow();
        } else {
          cow.activateFarting = false; 
          cowDomElem.css('width', '35%');
        }
      }, 5000);
    }    
    
  }
}
