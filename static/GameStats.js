
function GameStats(parent) {
  this.totalmatchAttempts = 0;
  this.totalGameMatches = 0;
  this.parent = parent;
  this.resources = ['gold-count','salt-count', 'diamond-count','win-total'];

  this.constructResources = function(){
    var lives = localStorage.getItem('lives');
    if(lives === null || lives === "0"){
      localStorage.setItem('lives', 3);
      lives = 3; 
    } 
    for(var index = 0 ; index < this.resources.length; index++){
      var item = localStorage.getItem(this.resources[index]);
      if(lives === '0'){
        item = 0; 
      }
      this.setInStorage(this.resources[index], item);
    }

    for( var lifeIndex = 3; lifeIndex > parseInt(lives) ; lifeIndex--){
      $('.lifeLeft' + lifeIndex).fadeOut();

    }
   }

  this.setInStorage = function(name, value, amount){
    if(value === null || value =='0' || localStorage.getItem('lives') === 0){
      localStorage.setItem(name, 0);
    } 
  }

  this.increment = function (resource) {
    var currentValue = localStorage.getItem(resource);
    localStorage.setItem(resource, ++currentValue);
  }
  this.decrement = function (resource) {
    var currentValue = localStorage.getItem(resource);
    var usedItem = true; 
    if(currentValue > 0){
      currentValue--; 
    } else {
      usedItem = false; 
    }
    localStorage.setItem(resource, currentValue);
    return usedItem;
  }
  this.renderGameStats = function () {
    var accuracy = this.getAccuracy();
    $('.diamonds span').text(localStorage.getItem('diamond-count'));
    $(".gold span").text(localStorage.getItem('gold-count'));
    $('.salt span').text(localStorage.getItem('salt-count'));
    $('.games-played .value').text(localStorage.getItem('win-total'));
    $('.accuracy .value').text(accuracy + "%");
    $('.attempts .value').text(this.totalmatchAttempts);
  };
  this.addLife = function () {
    var lifeLeft = localStorage.getItem('lives');
    if (lifeLeft < 3) {
      this.increment('lives');
      $('.lifeLeft' + lifeLeft).removeClass("loseLife");

    }
  }
  this.removeLife = function () {
    $('.lifeLeft' + localStorage.getItem('lives')).addClass("loseLife");
    this.decrement('lives');

  }
  this.getAccuracy = function () {
    var accuracy = Math.round((this.totalGameMatches/this.totalmatchAttempts)*100);; 
    return accuracy || 0; 
  }
  this.useResource = function () {
    var resource = $(event.target).closest('h3').attr('class');
    if (resource === 'diamonds' && localStorage.getItem('diamond-count') > 0 && localStorage.getItem('diamond-count') < 3) {
      this.addLife();
      this.decrement('diamond-count')
      $('.lifeLeft' + localStorage.getItem('lives')).removeClass("loseLife");
    } else if (resource === 'gold' && localStorage.getItem('gold-count') > 0 && game.curiumCountdown) {
      this.parent.eventForMatchedCards('curium');
      this.decrement('gold-count')
    } else if (resource === 'salt' && localStorage.getItem('salt-count') > 0) {
      this.parent.eventForMismatchedCards('hydrogen', 'carbon');
      this.decrement('salt-count')
    }
    this.renderGameStats();
  }
}

function displayInfoAboutElement() {
  if ($(this).next().hasClass('hidden')) {
    $('.elementProperties li ul').addClass('hidden');
  }
  $(this).next().toggleClass('hidden');
}