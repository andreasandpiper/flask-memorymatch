$(document).ready(initializeApp);

var game = null;
var gameStats = null;
var images = [{'chlorine': "/static/images/chlorine.jpg"},
{'hydrogen': "/static/images/hydrogen.jpg"},
{'carbon': "/static/images/carbon.jpg"},
{'neon': "/static/images/neon.jpg"},
{ 'sodium': "/static/images/sodium.jpg"},
{'curium': "/static/images/curium.jpg"},
{'calcium': "/static/images/calcium.jpg"},
{'gold': "/static/images/gold.jpg"},
{'oxygen': '/static/images/oxygen.jpg'}
]

function Game() {
  this.cards = null;
  this.matchCount = 0;
  this.cardsFlipped = [];
  this.dealCardsOnInterval = null;
  this.curiumCountdown = null;
  this.cow = null;
  this.gameStats = gameStats;

  this.initializeGame = function () {
    this.cards = this.createCards(images);
    this.cow = new Cow();
    gameStats.parent = this;
    this.gameStats.renderGameStats();
  };

  this.createCards = function (images) {
    var allImages = images.concat(images);
    var cardList = [];
    var domCardList = [];
    for (var i = 0; i < allImages.length; i++) {
      for (var element in allImages[i]) {
        var newCard = new Card(allImages[i][element], element, this);
        var cardDomElement = newCard.render();
        domCardList.push(cardDomElement);
        cardList.push(newCard);
      }
    }
    domCardList = this.shuffleCards(domCardList);
    this.dealCardsToDOM(domCardList);
    return cardList;
  };

  this.handleCardClicked = function (cardClicked) {
    if(this.cardsFlipped.length < 2){
      this.cardsFlipped.push(cardClicked);
      cardClicked.revealSelf();
      if(this.cardsFlipped.length === 2){
        if(this.cardsFlipped[0].selfType() === this.cardsFlipped[1].selfType() ){
          this.gameStats.totalGameMatches++;
          this.matchCount++;
          this.eventForMatchedCards(cardClicked.element);
          if(this.matchCount === images.length){
            this.winGame();
          }
          this.clearClickedCards();
        } else {
          this.eventForMismatchedCards(this.cardsFlipped[0].element, this.cardsFlipped[1].element);
          setTimeout(this.flipCardsBackOver.bind(this), 700)
        }
        this.gameStats.totalmatchAttempts++;
        this.gameStats.renderGameStats();
      }
    }
  };

  this.rearrangeExisitingDOMCards = function () {
    var arrayOfDomCards = $('.card').detach();
    var shuffledDOMCards = this.shuffleCards(arrayOfDomCards);
    this.dealCardsToDOM(shuffledDOMCards);
  }

  this.flipCardsBackOver = function () {
    this.cardsFlipped.forEach(function (card) {
      card.hideSelf()
    })
    this.clearClickedCards();
  }

  this.clearClickedCards = function () {
    this.cardsFlipped = [];
  };

  this.winGame = function () {
    $("#modal h1").text('you win');
    $('#modal').css('display', 'block');
    this.gameStats.increment('win-total');
    this.gameStats.renderGameStats();
  };

  this.gameOver = function () {
    $("#modal h1").text('Ahhh! Death by Hydrochloric Acid, you lose all your resources.');
    $('#modal').css('display', 'block');
    gameStats = new GameStats();
  }
}

Game.prototype.shuffleCards = function (array) {
  var newArray = [];
  var tempArray = array.slice();
  while (tempArray.length) {
    var randomIndex = Math.floor(Math.random() * tempArray.length);
    var card = tempArray[randomIndex];
    tempArray.splice(randomIndex, 1);
    newArray.push(card);
  }
  return newArray;
}

Game.prototype.dealCardsToDOM = function (array) {
  var index = 0;
  dealCardsOnInterval = setInterval(function () {
    $("#game-area").append(array[index]);
    index += 1;
    if (index === array.length) {
      clearInterval(dealCardsOnInterval);
    }
  }, 50);
}

Game.prototype.eventForMatchedCards = function (element) {
  switch (element) {
    case 'curium':
      if (this.curiumCountdown) {
        this.showTextForEvent('Phew! You stopped Curium from radiating!')
        this.curiumCountdown.stopCountDown();
        this.curiumCountdown = null;
      }
      break;
    case 'carbon':
      this.showTextForEvent('Diamonds are an allotrope of Carbon! Use them to save a life!')
      this.gameStats.increment('diamond-count');
      this.gameStats.renderGameStats();
      break;
    case 'gold':
      this.showTextForEvent('Gold! Use gold to prevent Curium from radioactive decay!')
      this.gameStats.increment('gold-count');
      this.gameStats.renderGameStats();
      break;
    case 'neon':
      this.showTextForEvent('COW!')
      this.cow.neonCow();
      break;
  }
}

Game.prototype.eventForMismatchedCards = function (element1, element2) {
  if (element1 === "carbon" && element2 === 'hydrogen' || element1 === 'hydrogen' && element2 === 'carbon') {
    this.showTextForEvent('You created methane! Watch the cow!')
    this.cow.methaneGasCow();
  } else if (element2 === 'chlorine' && element1 === 'sodium' || element1 === 'chlorine' && element2 === 'sodium' || element2 === 'chlorine' && element1 === 'calcium' || element1 === 'chlorine' && element2 === 'calcium') {
    this.showTextForEvent('You created a salt! Use salt to feed the cow.')
    this.gameStats.increment('salt-count');
    this.gameStats.renderGameStats();
  } else if (element1 === "chlorine" && element2 === 'hydrogen' || element1 === 'hydrogen' && element2 === 'chlorine') {
    this.showTextForEvent('Ouch! Hydrochloric Acid spilled everywhere! Lose one life due to chemical burn.')
    this.gameStats.removeLife();
    if (localStorage.getItem('lives') === "0") {
      this.gameOver();
    }
  } else if (element1 === 'curium' || element2 === 'curium') {
    this.showTextForEvent('Curium is radioactive! You have 5 seconds to find the Curium match before the decay shuffles the board! ')
    if (this.curiumCountdown) {
      return;
    }
    this.curiumCountdown = new CuriumCountdown(this);
    this.curiumCountdown.beginCountDown();
  } else if (element1 === "oxygen" && element2 === 'hydrogen' || element1 === 'hydrogen' && element2 === 'oxygen') {
    if (this.curiumCountdown) {
      return;
    }
    this.showTextForEvent('Hydrogen Perioxide! The board is shuffled so Hydrogen and Oxygen and their pairs are the top left corner')
    this.oxygenHydrogenMatch();
  }
}

Game.prototype.showTextForEvent = function (message) {
  $('.game-actions h3').text(message);
}

Game.prototype.oxygenHydrogenMatch = function () {
  //find all the oxygen and hydrogens
  //put them in the front of array
  var arrayOfDomCards = $('.card').detach();
  var newArray = [];
  var hydrogenCards = [];
  var oxygenCards = [];
  for (var card = 0; card < arrayOfDomCards.length; card++) {
    var elementName = $(arrayOfDomCards[card]).find('.front').attr('data-elem');
    if (elementName === 'hydrogen') {
      hydrogenCards.push(arrayOfDomCards[card]);
    } else if (elementName === 'oxygen') {
      oxygenCards.push(arrayOfDomCards[card]);
    } else {
      newArray.push(arrayOfDomCards[card]);
    }
  }
  newArray.unshift(hydrogenCards, oxygenCards);
  this.dealCardsToDOM(newArray);
}

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

function Card(image, element, parent) {
  this.revealed = false;
  this.element = element;
  this.parent = parent;
  this.frontImage = image;
  this.domElement = null;
  this.render = function () {
    var card = $('<div>', {
      'class': 'card',
    })
    card.click(this.handleClick.bind(this));
    var front = $('<div>', {
      'class': 'front',
      'css': {
        'background': "url(" + image + ")",
        'background-size': 'cover',
        'background-repeat': 'no-repeat'
      },
      'data-elem': this.element
    })
    var back = $('<div>', {
      'class': 'back',
    })
    this.backElement = back;
    card.append(back, front);
    this.domElement = card;
    return card;
  }
  this.handleClick = function () {
    if (!this.revealed) {
      this.parent.handleCardClicked(this);
    }
  }
  this.revealSelf = function () {
    this.revealed = true;
    this.backElement.hide();
  };
  this.hideSelf = function () {
    this.revealed = false;
    this.backElement.show();
  };
  this.selfType = function () {
    return this.frontImage;
  }
}

function devMode() {
  $('.back').css('opacity', '.5');
}

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

function GameStats(parent) {
  this.totalmatchAttempts = 0;
  this.totalGameMatches = 0;
  this.parent = parent;
  this.resources = ['gold-count','salt-count', 'diamond-count','win-total'];

  this.constructResources = function(){
    var lives = localStorage.getItem('lives');
    if(lives === null || lives === "0"){
      localStorage.setItem('lives', 3);
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
    } else if (resource === 'gold' && localStorage.getItem('gold-count') > 0) {
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

function initializeApp() {
  $('.resetGame').click(beginGame);
  gameStats = new GameStats();
  gameStats.constructResources();
  $(".elementProperties h3").on('click', displayInfoAboutElement);
  $('.resource').on('click', gameStats.useResource.bind(gameStats));
  beginGame();
}

function beginGame() {
  $('#game-area').empty();
  game = new Game();
  game.initializeGame();
}
