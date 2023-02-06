let start = true;

let score = 0;

let player = {};

let items = [];

// Games last 45 seconds
let timeRemaining = 45;

function update(game) {
  if (start) {
    return;
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.x == player.x && item.y == player.y) {
      score++;
      items.splice(i, 1);
      break;
    }
  }

  // Only generate an item 5% of the time
  if (Math.random() < 0.05) {
    item = {
      x: Math.floor(Math.random() * 24),
      y: Math.floor(Math.random() * 24),
    };
    if (item.x !== player.x || item.y !== player.y) {
      items.push(item);
    }
  }

  for (var item of items) {
    game.setDot(item.x, item.y, Color.Green);
  }

  game.setDot(player.x, player.y, Color.Black);

  game.setText("Score: ${score}");

  game.setText(`Time left: ${timeRemaining}s. Score: ${score}`);

  if (timeRemaining <= 0) {
    game.setText(`Game over! Final score: ${score}`);
    game.end();
  }
}

function create(game) {
  player = {
    x: 5,
    y: 10,
  };
  game.setDot(player.x, player.y, Color.Black);
  game.setText("Proverbs 3:5. Press arrow key to begin.");
}

function onKeyPress(direction) {
  if (start) {
    start = false;
    return;
  }

  if (direction == Direction.Up && player.y > 0) {
    player.y--;
  }
  if (direction == Direction.Down && player.y < 23) {
    player.y++;
  }
  if (direction == Direction.Left && player.x > 0) {
    player.x--;
  }
  if (direction == Direction.Right && player.x < 23) {
    player.x++;
  }
}

let config = {
  create: create,
  update: update,
  onKeyPress: onKeyPress,
};

let interval = setInterval(decreaseTimer, 1000);

function decreaseTimer() {
  timeRemaining--;
  if (timeRemaining == 0) {
    clearInterval(interval);
  }
}

let game = new Game(config);
game.run();
