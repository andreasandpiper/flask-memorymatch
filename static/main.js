$(document).ready(initializeApp);

var game = null;
var gameStats = null;

function initializeApp() {
  $('.resetGame').click(beginGame);
  gameStats = new GameStats();
  $(".elementProperties h3").on('click', displayInfoAboutElement);
  $('.resource').on('click', gameStats.useResource.bind(gameStats));
  beginGame();
}

function beginGame() {
  $('#game-area').empty();
  game = new Game();
  game.initializeGame();
}

function Game() {
  this.cards = null;
  this.matchCount = 0;
  this.matchCountWin = null;
  this.cardsFlipped = [];
  this.dealCardsOnInterval = null;
  this.curiumCountdown = null;
  this.images = [{
      'chlorine': "/static/images/chlorine.jpg"
    },
    {
      'hydrogen': "/static/images/hydrogen.jpg"
    },
    {
      'carbon': "/static/images/carbon.jpg"
    },
    {
      'neon': "/static/images/neon.jpg"
    },
    {
      'sodium': "/static/images/sodium.jpg"
    },
    {
      'curium': "/static/images/curium.jpg"
    },
    {
      'calcium': "/static/images/calcium.jpg"
    },
    {
      'gold': "/static/images/gold.jpg"
    },
    {
      'oxygen': '/static/images/oxygen.jpg'
    }
  ]
  this.cow = null;
  this.gameStats = gameStats;
  this.initializeGame = function () {
    var images = this.images.concat(this.images);
    this.matchCountWin = this.images.length;
    this.cards = this.createCards(images);
    this.cow = new Cow();
    gameStats.parent = this;
  };
  this.createCards = function (images) {
    var cardList = [];
    var domCardList = [];
    for (var i = 0; i < images.length; i++) {
      for (var element in images[i]) {
        var newCard = new Card(images[i][element], element, this);
        var cardDomElement = newCard.render();
        // $('#game-area').append(cardDomElement);
        domCardList.push(cardDomElement);
        cardList.push(newCard);
      }
    }
    domCardList = this.shuffleCards(domCardList);
    this.dealCardsToDOM(domCardList);
    return cardList;
  };
  this.handleCardClicked = function (cardClicked) {
    if (this.cardsFlipped.length < 2) {
      this.cardsFlipped.push(cardClicked);
      cardClicked.revealSelf();
      if (this.cardsFlipped.length === 2) {
        if (this.cardsFlipped[0].selfType() === this.cardsFlipped[1].selfType()) {
          $.ajax({
            url: '/game',
            data: {
              score: true
            },
            type: 'POST',
            success: function (response) {
              console.log(response)
              game.eventForMatchedCards(cardClicked.element);
              if (response.matches === game.images.length) {
                game.winGame();
              }
              game.clearClickedCards();
            },
            error: function (error) {
              console.log(error);
            }
          });
        } else {
          this.eventForMismatchedCards(this.cardsFlipped[0].element, this.cardsFlipped[1].element);
          setTimeout(this.flipCardsBackOver.bind(this), 700);
        }
  
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
    $.ajax({
      url: '/winner',
      type: 'POST',
      success: function (response) {
        console.log(response)
        if (response.status === 'true') {
          $(".modal").find('h1').text('you win');
          $('.modal').css('display', 'block');
        }
      },
      error: function (error) {
        console.log(error);
      }
    })
  };
  this.gameOver = function () {
    $(".modal").find('h1').text('you lose');
    var wins = this.gameStats.gamesWon;
    if (wins === 0) {
      this.displayLosingResult('.lose', wins)
    } else {
      this.displayLosingResult('.endgame', wins)
    }
    gameStats = new GameStats();
  }
  this.displayLosingResult = function (form, wins) {
    $('.games-played .value').text("0");
    $('.numberOfWins').text(wins);
    $(form).removeClass('hidden');
    $('.win').addClass('hidden');
    $('#modal').css('display', 'block');
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
      this.gameStats.diamondCount = this.gameStats.increment(this.gameStats.diamondCount);
      break;
    case 'gold':
      this.showTextForEvent('Gold! Use gold to prevent Curium from radioactive decay!')
      this.gameStats.goldCount = this.gameStats.increment(this.gameStats.goldCount);
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
    this.gameStats.saltCount = this.gameStats.increment(this.gameStats.saltCount);
    this.gameStats.renderGameStats();
  } else if (element1 === "chlorine" && element2 === 'hydrogen' || element1 === 'hydrogen' && element2 === 'chlorine') {
    this.showTextForEvent('Ouch! Hydrochloric Acid spilled everywhere! Lose one life due to chemical burn.')
    $('.lifeLeft' + this.gameStats.lives).fadeOut();
    this.gameStats.lives = this.gameStats.removeLife();
    if (this.gameStats.lives === 0) {
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
  this.gamesWon = parseInt($('.games-played .value').text());
  this.lives = 3;
  this.diamondCount = 0;
  this.saltCount = 0;
  this.goldCount = 0;
  this.totalmatchAttempts = 0;
  this.totalGameMatches = 0;
  this.parent = parent;
  this.increment = function (gameStat) {
    gameStat++;
    return gameStat;
  }
  this.decrement = function (gameStat) {
    if (gameStat > 0) {
      gameStat--;
      return gameStat;
    }
  }
  this.renderGameStats = function () {
    $('.diamonds span').text(this.diamondCount);
    $(".gold span").text(this.goldCount);
    $('.salt span').text(this.saltCount);
    $('.games-played .value').text(this.gamesWon);
    // this.getAccuracy();
  };
  this.addLife = function () {
    if (this.lives < 3) {
      this.lives = this.increment(this.lives);
    }
    return this.lives;
  }
  this.removeLife = function () {
    this.lives = this.decrement(this.lives);
    return this.lives;
  }
  this.useResource = function () {
    var resource = $(event.target).closest('h3').attr('class');
    if (resource === 'diamonds' && this.diamondCount > 0) {
      this.addLife();
      this.diamondCount--;
      $('.lifeLeft' + this.lives).fadeIn();
    } else if (resource === 'gold' && this.goldCount > 0) {
      this.parent.eventForMatchedCards('curium');
      this.goldCount--;
    } else if (resource === 'salt' && this.saltCount > 0) {
      this.parent.eventForMismatchedCards('hydrogen', 'carbon');
      this.saltCount--;
    }
  }
}

function displayInfoAboutElement() {
  if ($(this).next().hasClass('hidden')) {
    $('.elementProperties li ul').addClass('hidden');
  }
  $(this).next().toggleClass('hidden');
}