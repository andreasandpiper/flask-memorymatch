
function Game() {
  this.cards = null;
  this.matchCount = 0;
  this.cardsFlipped = [];
  this.dealCardsOnInterval = null;
  this.curiumCountdown = null;
  this.gameStats = gameStats;

  this.initializeGame = function () {
    this.cards = this.createCards(images);
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
    $("#modal h1").text('Hydrogen Five! You\'ve matched all the elements!');
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
      cow.neonCow();
      break;
  }
}

Game.prototype.eventForMismatchedCards = function (element1, element2) {
  if (element1 === "carbon" && element2 === 'hydrogen' || element1 === 'hydrogen' && element2 === 'carbon') {
    this.showTextForEvent('You created methane! Watch the cow!')
    cow.methaneGasCow();
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