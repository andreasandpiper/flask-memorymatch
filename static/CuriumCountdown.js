function CuriumCountdown(parent) {
  this.parent = parent;
  this.countDownDisplay = null;
  this.countDownEvent = null
  this.beginCountDown = function () {
    var index = 5;
    var self = this.parent;
    this.countDownDisplay = setInterval(function () {
      $('.countDown').text(index);
      index -= 1;
    }, 1000);
    this.countDownEvent = setTimeout(function () {
      curiumShuffle(self);
      self.curiumCountdown.stopCountDown();
      self.curiumCountdown = null;
    }, 7000)
  }
  this.stopCountDown = function () {
    clearInterval(this.countDownDisplay);
    clearInterval(this.countDownEvent);
    $('.countDown').text("");
  }
}

function curiumShuffle(parent) {
  parent.rearrangeExisitingDOMCards();
}