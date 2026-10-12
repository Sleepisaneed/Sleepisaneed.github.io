const diceForm = document.getElementById("dice-form");
const wagerInput = document.getElementById("wager");
const targetInputs = [...document.querySelectorAll('input[name="target"]')];
const wagerHint = document.getElementById("wager-hint");
const rollButton = document.getElementById("roll-button");
const resetButton = document.getElementById("reset-game");
const dailyBonusButton = document.getElementById("daily-bonus");
const dailyBonusStatus = document.getElementById("daily-bonus-status");
const balanceElement = document.getElementById("credit-balance");
const totalElement = document.getElementById("dice-total");
const resultElement = document.getElementById("dice-result");
const historyList = document.getElementById("roll-history");
const dieElements = [
  document.getElementById("die-one"),
  document.getElementById("die-two"),
];
const roundElement = document.getElementById("round-count");
const winElement = document.getElementById("win-count");
const lossElement = document.getElementById("loss-count");

const startingCredits = 100;
const maximumWager = 25;
const historyLimit = 5;
const dailyBonus = 25;

function getTodayKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

const savedGame = window.MPrintPoints.load();
let credits = savedGame.credits;
let lastBonusDate = savedGame.lastBonusDate;
let rounds = 0;
let wins = 0;
let losses = 0;
let isRolling = false;
let rollAnimation;

function saveGame() {
  window.MPrintPoints.save({ credits, lastBonusDate });
}

function refreshSavedPoints() {
  const savedGame = window.MPrintPoints.load();
  credits = savedGame.credits;
  lastBonusDate = savedGame.lastBonusDate;
  updateBalance();
}

function resetRoundStats() {
  rounds = 0;
  wins = 0;
  losses = 0;
  roundElement.textContent = "0";
  winElement.textContent = "0";
  lossElement.textContent = "0";
  historyList.replaceChildren();
}

function resetRoundState(message = "Choose a total, place your wager, and roll to start.") {
  if (rollAnimation) {
    window.clearTimeout(rollAnimation);
    rollAnimation = undefined;
  }

  resetRoundStats();
  isRolling = false;
  dieElements.forEach((die) => {
    die.classList.remove("is-rolling");
    setDie(die, 1);
  });
  targetInputs.forEach((input) => {
    input.checked = false;
  });
  wagerInput.value = "10";
  wagerInput.setCustomValidity("");
  totalElement.textContent = "--";
  resultElement.textContent = message;
  const emptyMessage = document.createElement("li");
  emptyMessage.className = "history-empty";
  emptyMessage.textContent = "Your rolls will show up here.";
  historyList.append(emptyMessage);
  rollButton.textContent = "Roll the dice";
  updateBalance();
}

function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

function updateBalance() {
  balanceElement.textContent = String(credits);
  wagerInput.max = String(Math.min(maximumWager, credits));
  rollButton.disabled = credits < 1 || isRolling;
  wagerInput.disabled = credits < 1 || isRolling;
  targetInputs.forEach((input) => {
    input.disabled = isRolling || input.value === "7" || input.value === "11";
  });
  resetButton.disabled = isRolling;
  dailyBonusButton.disabled = lastBonusDate === getTodayKey() || isRolling;
  dailyBonusStatus.textContent = lastBonusDate === getTodayKey()
    ? "Today's bonus is claimed. Come back tomorrow for 25 more M-Points."
    : "Claim 25 free M-Points once a day.";
  wagerHint.textContent = credits < 1
    ? "You're out of M-Points. Claim your daily bonus to play again."
    : `Choose a total and wager between 1 and ${Math.min(maximumWager, credits)} M-Points.`;
}

function setDie(die, value) {
  die.dataset.value = String(value);
  die.setAttribute("aria-label", `${die.id === "die-one" ? "Die one" : "Die two"}: ${value}`);
}

function addHistory(dieOne, dieTwo, total, message, isWin) {
  const emptyMessage = historyList.querySelector(".history-empty");
  if (emptyMessage) {
    emptyMessage.remove();
  }

  const item = document.createElement("li");
  item.className = isWin ? "history-win" : "history-loss";

  const roll = document.createElement("span");
  roll.textContent = `${dieOne} + ${dieTwo} = ${total}`;
  const outcome = document.createElement("strong");
  outcome.textContent = message;
  item.append(roll, outcome);
  historyList.prepend(item);

  while (historyList.children.length > historyLimit) {
    historyList.lastElementChild.remove();
  }
}

function playRound(wager, target) {
  const dieOne = rollDie();
  const dieTwo = rollDie();
  const total = dieOne + dieTwo;
  const gameOver = total === 7 || total === 11;
  const matchedBet = total === target;
  const multiplier = target === 2 ? 2 : 4;
  const payout = matchedBet ? wager * multiplier : 0;
  credits -= wager;
  credits += payout;
  rounds += 1;
  if (matchedBet) {
    wins += 1;
  } else {
    losses += 1;
  }

  setDie(dieElements[0], dieOne);
  setDie(dieElements[1], dieTwo);
  totalElement.textContent = String(total);
  if (gameOver) {
    resetRoundStats();
    targetInputs.forEach((input) => {
      input.checked = false;
    });
    resultElement.textContent = `Game over! You bet on ${target}, rolled ${total}, and lost ${wager} M-Points. A new game has started.`;
    const gameOverItem = document.createElement("li");
    gameOverItem.className = "history-loss";
    const roll = document.createElement("span");
    roll.textContent = `${dieOne} + ${dieTwo} = ${total}`;
    const outcome = document.createElement("strong");
    outcome.textContent = `Bet ${target} — game over, ${wager} M-Points lost`;
    gameOverItem.append(roll, outcome);
    historyList.append(gameOverItem);
  } else {
    const message = matchedBet
      ? `You hit ${target}! You earned ${payout - wager} M-Points (${payout} returned).`
      : `You rolled ${total}, not ${target}. You lost ${wager} M-Points; keep playing!`;
    resultElement.textContent = message;
    roundElement.textContent = String(rounds);
    winElement.textContent = String(wins);
    lossElement.textContent = String(losses);
    addHistory(dieOne, dieTwo, total, message, matchedBet);
  }
  saveGame();
  updateBalance();
}

diceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isRolling) {
    return;
  }

  const wager = Number(wagerInput.value);
  const selectedTarget = targetInputs.find((input) => input.checked);
  const target = selectedTarget ? Number(selectedTarget.value) : NaN;
  if (!Number.isInteger(target) || target < 2 || target > 12 || target === 7 || target === 11) {
    resultElement.textContent = "Choose a valid total from 2 to 12. You can't bet on 7 or 11.";
    return;
  }
  if (!Number.isInteger(wager) || wager < 1 || wager > maximumWager || wager > credits) {
    wagerInput.setCustomValidity(
      `Enter a whole-number wager between 1 and ${Math.min(maximumWager, credits)} M-Points.`,
    );
    wagerInput.reportValidity();
    wagerInput.addEventListener("input", () => wagerInput.setCustomValidity(""), { once: true });
    return;
  }

  wagerInput.setCustomValidity("");
  isRolling = true;
  updateBalance();
  rollButton.textContent = "Rolling…";
  dieElements.forEach((die) => die.classList.add("is-rolling"));

  rollAnimation = window.setTimeout(() => {
    dieElements.forEach((die) => die.classList.remove("is-rolling"));
    playRound(wager, target);
    isRolling = false;
    rollButton.textContent = "Roll the dice";
    updateBalance();
  }, 420);
});

dailyBonusButton.addEventListener("click", () => {
  const today = getTodayKey();
  if (lastBonusDate === today || isRolling) {
    return;
  }

  credits += dailyBonus;
  lastBonusDate = today;
  saveGame();
  resultElement.textContent = `Daily bonus claimed! You earned ${dailyBonus} M-Points.`;
  updateBalance();
});

resetButton.addEventListener("click", () => {
  resetRoundState("New game started. Your M-Points balance is unchanged.");
});

updateBalance();

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    refreshSavedPoints();
    resetRoundState();
  }
});

window.addEventListener("storage", (event) => {
  if (event.key === "mprint-dice-game" && !isRolling) {
    refreshSavedPoints();
  }
});
