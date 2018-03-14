$(document).ready(initializeApp);

var game = null;
var cow = null; 
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

function initializeApp() {
  $('.resetGame').click(beginGame);
  cow = new Cow();
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

function devMode() {
  $('.back').css('opacity', '.5');
}