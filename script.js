let money = 1000;
const moneySpan = document.getElementById('money');

function updateMoney(amount) {
  money += amount;
  moneySpan.textContent = money;
}

function switchGame(gameName) {
  document.querySelectorAll('.game').forEach(game => game.classList.add('hidden'));
  document.getElementById(gameName).classList.remove('hidden');
}

// Slots Game
const slotSymbols = ['🍒', '🍋', '🍇', '💎', '7️⃣', '🌟'];
const slots = document.querySelectorAll('.slot');

function playSlots() {
  const bet = parseInt(document.getElementById('slots-bet').value);
  if (isNaN(bet) || bet < 1) {
    alert('Please enter a valid bet amount!');
    return;
  }
  if (bet > money) {
    alert('Not enough money!');
    return;
  }

  // Disable spin button while animation is running
  const spinButton = document.querySelector('#slots button');
  spinButton.disabled = true;

  updateMoney(-bet);
  slots.forEach(slot => slot.classList.add('spinning'));

  const results = [];
  const stopTimes = [1000, 1500, 2000];

  slots.forEach((slot, i) => {
    setTimeout(() => {
      slot.classList.remove('spinning');
      const symbol = slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
      results.push(symbol);
      slot.textContent = symbol;

      if (i === 2) {
        const win = checkSlotsWin(results, bet);
        if (win > 0) {
          updateMoney(win);
          alert(`You won $${win}!`);
        }
      }
      // Re-enable spin button after last slot stops
      if (i === 2) {
        const spinButton = document.querySelector('#slots button');
        spinButton.disabled = false;
      }
    }, stopTimes[i]);
  });
}

function checkSlotsWin(results, bet) {
  if (results[0] === results[1] && results[1] === results[2]) {
    return bet * (slotSymbols.indexOf(results[0]) + 3);
  }
  if (results[0] === results[1] || results[1] === results[2]) {
    return Math.floor(bet * 1.5);
  }
  return 0;
}

// Blackjack Game
let deck = [];
let playerHand = [];
let dealerHand = [];
let blackjackBet = 0;

function createDeck() {
  const suits = ['♠', '♣', '♥', '♦'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function startBlackjack() {
  blackjackBet = parseInt(document.getElementById('blackjack-bet').value);
  if (blackjackBet > money) {
    alert('Not enough money!');
    return;
  }
  updateMoney(-blackjackBet);

  createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  updateBlackjackDisplay();
}

function hit() {
  playerHand.push(deck.pop());
  updateBlackjackDisplay();

  if (calculateHand(playerHand) > 21) {
    alert('Bust! You lose!');
    endBlackjackRound();
  }
}

function stand() {
  if (playerHand.length === 0) {
    alert('Please start a new game first!');
    return;
  }

  while (calculateHand(dealerHand) < 17) {
    dealerHand.push(deck.pop());
  }
  updateBlackjackDisplay();

  const playerScore = calculateHand(playerHand);
  const dealerScore = calculateHand(dealerHand);

  if (dealerScore > 21) {
    updateMoney(blackjackBet * 2);
    alert('Dealer busts! You win!');
  } else if (playerScore > dealerScore) {
    updateMoney(blackjackBet * 2);
    alert('You win!');
  } else if (dealerScore > playerScore) {
    alert('Dealer wins!');
  } else {
    updateMoney(blackjackBet);
    alert('Push!');
  }
  endBlackjackRound();
}

function calculateHand(hand) {
  let sum = 0;
  let aces = 0;

  for (let card of hand) {
    if (card.value === 'A') {
      aces++;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      sum += 10;
    } else {
      sum += parseInt(card.value);
    }
  }

  for (let i = 0; i < aces; i++) {
    if (sum + 11 <= 21) {
      sum += 11;
    } else {
      sum += 1;
    }
  }

  return sum;
}

function updateBlackjackDisplay() {
  document.querySelector('#dealer-hand span').textContent = 
    dealerHand.map(card => `${card.value}${card.suit}`).join(' ');
  document.querySelector('#player-hand span').textContent = 
    playerHand.map(card => `${card.value}${card.suit}`).join(' ');
}

function endBlackjackRound() {
  playerHand = [];
  dealerHand = [];
  updateBlackjackDisplay();
}

// Roulette Game
const rouletteWheel = document.querySelector('.roulette-wheel');
let currentBet = '';

function placeBet(color) {
  currentBet = color;
}

function spinRoulette() {
  if (!currentBet) {
    alert('Please place a bet first!');
    return;
  }

  const bet = parseInt(document.getElementById('roulette-bet').value);
  if (isNaN(bet) || bet < 1) {
    alert('Please enter a valid bet amount!');
    return;
  }
  if (bet > money) {
    alert('Not enough money!');
    return;
  }

  // Disable buttons while spinning
  document.querySelectorAll('.bet-options button, #roulette button').forEach(btn => btn.disabled = true);

  updateMoney(-bet);
  rouletteWheel.classList.add('spinning');

  setTimeout(() => {
    rouletteWheel.classList.remove('spinning');
    const result = Math.random();
    let color;

    if (result < 0.45) color = 'red';
    else if (result < 0.9) color = 'black';
    else color = 'green';

    if (color === currentBet) {
      const multiplier = color === 'green' ? 14 : 2;
      const winnings = bet * multiplier;
      updateMoney(winnings);
      alert(`You won $${winnings}!`);
    } else {
      alert('Better luck next time!');
    }
    currentBet = '';
    // Re-enable buttons after spin
    document.querySelectorAll('.bet-options button, #roulette button').forEach(btn => btn.disabled = false);
  }, 2000);
}
