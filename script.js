let money = parseInt(localStorage.getItem('casinoMoney')) || 1000;
const moneySpan = document.getElementById('money');
moneySpan.textContent = formatNumber(money);

// Code system
const codes = {
  'OGScratchCards': {
    lastUsed: 0,
    cooldown: 7200000, // 2 hours in milliseconds
    duration: 300000,  // 5 minutes in milliseconds
    active: false,
    name: 'OG Scratch Cards'
  },
  'DeVmOdECS': {
    lastUsed: 0,
    cooldown: 0,      // Can be used anytime
    duration: 0,      // Instant effect
    name: 'Dev Mode'
  },
  'LuckBoost': {
    lastUsed: 0,
    cooldown: 7200000, // 2 hours in milliseconds
    duration: 300000,  // 5 minutes in milliseconds
    active: false,
    name: 'Luck Boost'
  },
  'MUNYBOOST': {
    lastUsed: 0,
    cooldown: 7200000, // 2 hours in milliseconds
    duration: 300000,  // 5 minutes in milliseconds
    active: false,
    name: 'Money Multiplier'
  }
};

function saveGame() {
  localStorage.setItem('casinoMoney', money);
  localStorage.setItem('casinoCodes', JSON.stringify(codes));
}

function updateBoostDisplays() {
  // Update active boosts
  const activeBoosts = Object.entries(codes)
    .filter(([_, data]) => data.active)
    .map(([_, data]) => data.name);
  
  const activeBoostsDiv = document.getElementById('active-boosts');
  activeBoostsDiv.textContent = activeBoosts.length ? `Active Boosts: ${activeBoosts.join(', ')}` : 'No Active Boosts';

  // Update cooldowns
  const cooldownsDiv = document.getElementById('boost-cooldowns');
  const now = Date.now();
  const cooldowns = Object.entries(codes)
    .filter(([_, data]) => data.cooldown > 0)
    .map(([_, data]) => {
      const timeLeft = Math.max(0, data.cooldown - (now - data.lastUsed));
      const minutesLeft = Math.ceil(timeLeft / 60000);
      return minutesLeft > 0 ? `${data.name}: ${minutesLeft}m` : '';
    })
    .filter(text => text);
  
  cooldownsDiv.textContent = cooldowns.length ? `Cooldowns: ${cooldowns.join(', ')}` : 'No Active Cooldowns';
}

// Update displays every second
setInterval(updateBoostDisplays, 1000);

// Load saved code states
const savedCodes = localStorage.getItem('casinoCodes');
if (savedCodes) {
  const parsedCodes = JSON.parse(savedCodes);
  // Update only the dynamic properties
  Object.keys(codes).forEach(code => {
    if (parsedCodes[code]) {
      codes[code].lastUsed = parsedCodes[code].lastUsed;
      codes[code].active = parsedCodes[code].active;
    }
  });
}

function addHalfMoney() {
  const currentGame = document.querySelector('.game:not(.hidden)');
  if (currentGame) {
    const betInput = currentGame.querySelector('input[type="number"]');
    if (betInput) {
      const currentBet = parseInt(betInput.value) || 0;
      betInput.value = currentBet + Math.floor(money / 2);
    }
  }
}

function addAllMoney() {
  const currentGame = document.querySelector('.game:not(.hidden)');
  if (currentGame) {
    const betInput = currentGame.querySelector('input[type="number"]');
    if (betInput) {
      const currentBet = parseInt(betInput.value) || 0;
      betInput.value = currentBet + money;
    }
  }
}

function formatNumber(num) {
  if (num >= 1e21) return (num/1e21).toFixed(1) + 'Sx';
  if (num >= 1e18) return (num/1e18).toFixed(1) + 'Qn';
  if (num >= 1e15) return (num/1e15).toFixed(1) + 'Q';
  if (num >= 1e12) return (num/1e12).toFixed(1) + 'T';
  if (num >= 1e9) return (num/1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num/1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num/1e3).toFixed(1) + 'K';
  return num.toString();
}

function restartGame() {
  if (confirm('Are you sure you want to reset your money to 1000?')) {
    money = 1000;
    moneySpan.textContent = formatNumber(money);
    saveGame();
  }
}


function redeemCode() {
  const code = document.getElementById('code-input').value;
  if (!codes.hasOwnProperty(code)) {
    alert('Invalid code!');
    return;
  }

  const codeData = codes[code];
  const now = Date.now();

  if (now - codeData.lastUsed < codeData.cooldown) {
    const minutesLeft = Math.ceil((codeData.cooldown - (now - codeData.lastUsed)) / 60000);
    alert(`This code is on cooldown! Try again in ${minutesLeft} minutes.`);
    return;
  }

  switch(code) {
    case 'OGScratchCards':
      codeData.active = true;
      codeData.lastUsed = now;
      setTimeout(() => {
        codeData.active = false;
        alert('OG Scratch Cards boost has expired!');
      }, codeData.duration);
      alert('OG Scratch Cards boost activated for 5 minutes!');
      break;

    case 'DeVmOdECS':
      const amount = prompt('Enter desired money amount:');
      if (amount && !isNaN(amount)) {
        money = parseInt(amount);
        moneySpan.textContent = money;
      }
      break;

    case 'LuckBoost':
      codeData.active = true;
      codeData.lastUsed = now;
      setTimeout(() => {
        codeData.active = false;
        alert('Luck boost has expired!');
      }, codeData.duration);
      alert('Luck boost activated for 5 minutes!');
      break;
      
    case 'MUNYBOOST':
      codeData.active = true;
      codeData.lastUsed = now;
      setTimeout(() => {
        codeData.active = false;
        alert('Money boost has expired!');
      }, codeData.duration);
      alert('Money boost (2x) activated for 2 minutes!');
      break;
  }

  document.getElementById('code-input').value = '';
}

function updateMoney(amount) {
  const multiplier = codes['MUNYBOOST'].active ? 2 : 1;
  money += amount * multiplier;
  moneySpan.textContent = formatNumber(money);
  saveGame();
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

// Poker Game
let pokerDeck = [];
let pokerHand = [];
let heldCards = new Array(5).fill(false);
let pokerBet = 0;

function startPoker() {
  pokerBet = parseInt(document.getElementById('poker-bet').value);
  if (pokerBet > money) {
    alert('Not enough money!');
    return;
  }
  updateMoney(-pokerBet);

  createPokerDeck();
  pokerHand = [];
  heldCards = new Array(5).fill(false);
  for (let i = 0; i < 5; i++) {
    pokerHand.push(pokerDeck.pop());
  }
  document.getElementById('poker-actions').style.display = 'block';
  updatePokerDisplay();
}

function createPokerDeck() {
  const suits = ['♠', '♣', '♥', '♦'];
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  pokerDeck = [];
  for (let suit of suits) {
    for (let value of values) {
      pokerDeck.push({ suit, value });
    }
  }
  shuffle(pokerDeck);
}

function holdCard(index) {
  heldCards[index] = !heldCards[index];
  updatePokerDisplay();
}

function drawCards() {
  for (let i = 0; i < 5; i++) {
    if (!heldCards[i]) {
      pokerHand[i] = pokerDeck.pop();
    }
  }
  checkPokerWin();
  document.getElementById('poker-actions').style.display = 'none';
  updatePokerDisplay();
}

function updatePokerDisplay() {
  const pokerHandDiv = document.getElementById('poker-hand');
  pokerHandDiv.innerHTML = '';
  pokerHand.forEach((card, index) => {
    const cardDiv = document.createElement('div');
    cardDiv.className = `poker-card ${['♥', '♦'].includes(card.suit) ? 'red' : ''} ${heldCards[index] ? 'held' : ''}`;
    cardDiv.textContent = `${card.value}${card.suit}`;
    pokerHandDiv.appendChild(cardDiv);
  });
}

function checkPokerWin() {
  const values = pokerHand.map(card => card.value);
  const suits = pokerHand.map(card => card.suit);

  // Check for winning combinations and pay out accordingly
  if (isRoyalFlush(values, suits)) {
    updateMoney(pokerBet * 250);
    alert('Royal Flush! You won $' + (pokerBet * 250) + '!');
  } else if (isStraightFlush(values, suits)) {
    updateMoney(pokerBet * 50);
    alert('Straight Flush! You won $' + (pokerBet * 50) + '!');
  } else if (isFourOfAKind(values)) {
    updateMoney(pokerBet * 25);
    alert('Four of a Kind! You won $' + (pokerBet * 25) + '!');
  } else if (isFullHouse(values)) {
    updateMoney(pokerBet * 9);
    alert('Full House! You won $' + (pokerBet * 9) + '!');
  } else if (isFlush(suits)) {
    updateMoney(pokerBet * 6);
    alert('Flush! You won $' + (pokerBet * 6) + '!');
  } else if (isStraight(values)) {
    updateMoney(pokerBet * 4);
    alert('Straight! You won $' + (pokerBet * 4) + '!');
  } else if (isThreeOfAKind(values)) {
    updateMoney(pokerBet * 3);
    alert('Three of a Kind! You won $' + (pokerBet * 3) + '!');
  } else if (isTwoPair(values)) {
    updateMoney(pokerBet * 2);
    alert('Two Pair! You won $' + (pokerBet * 2) + '!');
  } else if (isJacksOrBetter(values)) {
    updateMoney(pokerBet);
    alert('Jacks or Better! You won $' + pokerBet + '!');
  } else {
    alert('No winning hand. Better luck next time!');
  }
}

function isRoyalFlush(values, suits) {
  return isStraightFlush(values, suits) && values.includes('A') && values.includes('K');
}

function isStraightFlush(values, suits) {
  return isFlush(suits) && isStraight(values);
}

function isFourOfAKind(values) {
  return values.some(v => values.filter(x => x === v).length === 4);
}

function isFullHouse(values) {
  return isThreeOfAKind(values) && isTwoPair(values);
}

function isFlush(suits) {
  return suits.every(s => s === suits[0]);
}

function isStraight(values) {
  const order = '23456789TJQKA';
  const valueSet = new Set(values);
  return order.includes([...valueSet].sort().join(''));
}

function isThreeOfAKind(values) {
  return values.some(v => values.filter(x => x === v).length === 3);
}

function isTwoPair(values) {
  const pairs = values.filter(v => values.filter(x => x === v).length === 2);
  return new Set(pairs).size >= 2;
}

function isJacksOrBetter(values) {
  return ['J', 'Q', 'K', 'A'].some(v => values.filter(x => x === v).length === 2);
}

// Lottery Game
function generateLotteryNumbers() {
  const numbers = [];
  while (numbers.length < 6) {
    const num = Math.floor(Math.random() * 49) + 1;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
}

function playLottery() {
  const bet = parseInt(document.getElementById('lottery-bet').value);
  if (bet > money) {
    alert('Not enough money!');
    return;
  }
  updateMoney(-bet);

  const playerNumbers = generateLotteryNumbers();
  const winningNumbers = generateLotteryNumbers();

  // Display the numbers
  const numbersDiv = document.querySelector('.lottery-numbers');
  numbersDiv.innerHTML = '';
  playerNumbers.forEach(num => {
    const numDiv = document.createElement('div');
    numDiv.className = 'lottery-number';
    numDiv.textContent = num;
    numbersDiv.appendChild(numDiv);
  });

  // Check matches
  const matches = playerNumbers.filter(num => winningNumbers.includes(num)).length;
  let winnings = 0;

  switch (matches) {
    case 6: winnings = bet * 1000000; break;
    case 5: winnings = bet * 5000; break;
    case 4: winnings = bet * 100; break;
    case 3: winnings = bet * 10; break;
    case 2: winnings = bet * 2; break;
  }

  if (winnings > 0) {
    updateMoney(winnings);
    alert(`Matched ${matches} numbers! You won $${winnings}!`);
  } else {
    alert('No matches. Better luck next time!');
  }

  // Update history
  const historyDiv = document.getElementById('lottery-history');
  historyDiv.innerHTML = `Winning numbers were: ${winningNumbers.join(', ')}<br>You matched ${matches} numbers`;
}

// Scratch Card Game
function playScratchCard() {
  const bet = parseInt(document.getElementById('scratchcard-bet').value);
  if (bet > money) {
    alert('Not enough money!');
    return;
  }
  updateMoney(-bet);

  const symbols = ['💎', '💰', '🎰', '🍀', '⭐', '7️⃣'];
  const grid = document.getElementById('scratch-grid');
  grid.innerHTML = '';

  const cells = [];
  for (let i = 0; i < 9; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    cells.push(symbol);
    const cell = document.createElement('div');
    cell.className = 'scratch-cell';
    cell.dataset.symbol = symbol;
    cell.onclick = () => revealCell(cell, cells, bet);
    grid.appendChild(cell);
  }
}

function revealCell(cell, cells, bet) {
  if (cell.classList.contains('revealed')) return;

  cell.textContent = cell.dataset.symbol;
  cell.classList.add('revealed');

  // Count revealed cells
  const revealed = document.querySelectorAll('.scratch-cell.revealed').length;

  if (revealed === 9) {
    // Check for wins
    const counts = {};
    cells.forEach(symbol => {
      counts[symbol] = (counts[symbol] || 0) + 1;
    });

    let winAmount = 0;
    Object.values(counts).forEach(count => {
      // Use original multipliers if OGScratchCards boost is active
      if (codes['OGScratchCards'].active) {
        if (count === 3) winAmount = bet * 5;
        if (count === 4) winAmount = bet * 10;
        if (count === 5) winAmount = bet * 25;
        if (count >= 6) winAmount = bet * 50;
      } else {
        if (count === 3) winAmount = bet * 2;
        if (count === 4) winAmount = bet * 5;
        if (count === 5) winAmount = bet * 10;
        if (count >= 6) winAmount = bet * 20;
      }
    });

    // Apply luck boost if active
    if (codes['LuckBoost'].active && winAmount === 0 && Math.random() < 0.3) {
      winAmount = bet * 2; // Give minimum win on lucky second chance
    }

    if (winAmount > 0) {
      updateMoney(winAmount);
      alert(`Congratulations! You won $${winAmount}!`);
    } else {
      alert('Better luck next time!');
    }
  }
}