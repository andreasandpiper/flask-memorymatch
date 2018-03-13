
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