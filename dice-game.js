const diceForm = document.getElementById("dice-form");
const targetInputs = [...document.querySelectorAll('input[name="target"]')];
const wagerInputs = [...document.querySelectorAll("[data-wager-target]")];
const wagerHint = document.getElementById("wager-hint");
const totalWagerElement = document.getElementById("total-wager");
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

const maximumWager = 25;
const historyLimit = 5;

let credits = 0;
let lastBonusDate = null;
let rounds = 0;
let wins = 0;
let losses = 0;
let isRolling = false;
let rollAnimation;

function getTodayKey() {
  const today = new Date();
  const month = String(today.getUTCMonth() + 1).padStart(2, "0");
  const day = String(today.getUTCDate()).padStart(2, "0");
  return `${today.getUTCFullYear()}-${month}-${day}`;
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

function resetRoundState(message = "Choose totals, set your wagers, and roll to start.") {
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
  wagerInputs.forEach((input) => {
    input.value = "10";
    input.setCustomValidity("");
  });
  totalElement.textContent = "--";
  resultElement.textContent = message;
  const emptyMessage = document.createElement("li");
  emptyMessage.className = "history-empty";
  emptyMessage.textContent = "Your rolls will show up here.";
  historyList.append(emptyMessage);
  rollButton.textContent = "Roll the dice";
  updateBalance();
}

function updateBalance() {
  balanceElement.textContent = String(credits);
  rollButton.disabled = credits < 1 || isRolling;
  targetInputs.forEach((input) => {
    input.disabled = isRolling || input.value === "7" || input.value === "11";
  });
  wagerInputs.forEach((input) => {
    const targetInput = targetInputs.find((target) => target.value === input.dataset.wagerTarget);
    input.max = String(Math.min(maximumWager, credits));
    input.disabled = credits < 1 || isRolling || !targetInput.checked;
    targetInput.closest(".target-option").classList.toggle("is-selected", targetInput.checked);
  });
  resetButton.disabled = isRolling;
  dailyBonusButton.disabled = lastBonusDate === getTodayKey() || isRolling;
  dailyBonusStatus.textContent = lastBonusDate === getTodayKey()
    ? "Today's bonus is claimed. Come back tomorrow for 25 more M-Points."
    : "Claim 25 free M-Points once a day.";
  const selectedWagers = targetInputs
    .filter((input) => input.checked)
    .map((input) => wagerInputs.find((wager) => wager.dataset.wagerTarget === input.value));
  const totalWager = selectedWagers.reduce((sum, input) => sum + (Number(input.value) || 0), 0);
  totalWagerElement.textContent = `${totalWager} M-Points`;
  wagerHint.textContent = credits < 1
    ? "You're out of M-Points. Claim your daily bonus to play again."
    : `Each selected total needs a 1–${Math.min(maximumWager, credits)} M-Points wager. Your combined bets can't exceed your balance.`;
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

function showCompletedRoll(result, bets) {
  const { dieOne, dieTwo, total, points, payout, winningTarget, doubles, gameOver } = result;
  const totalWager = bets.reduce((sum, bet) => sum + bet.wager, 0);
  const winningBet = bets.find((bet) => bet.target === winningTarget);
  const isWin = Boolean(winningBet);
  credits = points;
  rounds += 1;
  if (isWin) {
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
    resultElement.textContent = `Game over! You rolled ${total} and lost all ${totalWager} M-Points wagered. A new game has started.`;
    const gameOverItem = document.createElement("li");
    gameOverItem.className = "history-loss";
    const roll = document.createElement("span");
    roll.textContent = `${dieOne} + ${dieTwo} = ${total}`;
    const outcome = document.createElement("strong");
    outcome.textContent = `Game over — ${totalWager} M-Points lost across ${bets.length} bets`;
    gameOverItem.append(roll, outcome);
    historyList.append(gameOverItem);
  } else {
    const losingWager = totalWager - (winningBet?.wager || 0);
    const netChange = payout - totalWager;
    const netMessage = netChange >= 0 ? `net +${netChange}` : `net ${netChange}`;
    const message = winningBet
      ? `You hit ${winningTarget}!${doubles ? " Doubles doubled that payout!" : ""} Bet ${winningBet.wager}, returned ${payout}, ${netMessage} M-Points.${losingWager ? ` Other bets lost: ${losingWager}.` : ""}`
      : `You rolled ${total}, not one of your bets. You lost ${totalWager} M-Points; keep playing!`;
    resultElement.textContent = message;
    roundElement.textContent = String(rounds);
    winElement.textContent = String(wins);
    lossElement.textContent = String(losses);
    addHistory(dieOne, dieTwo, total, message, isWin);
  }
}

function applyProfile(profile) {
  credits = Number(profile?.points ?? 100);
  lastBonusDate = profile?.daily_bonus_claimed_on ?? null;
  updateBalance();
}

async function initializeGame() {
  try {
    await window.MPrintPoints.ready;
    applyProfile(window.MPrintPoints.getProfile());
  } catch (error) {
    resultElement.textContent = `M-Points couldn't be loaded: ${error.message}`;
  }
}

diceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (isRolling) {
    return;
  }

  const bets = targetInputs
    .filter((input) => input.checked)
    .map((input) => ({
      target: Number(input.value),
      wagerInput: wagerInputs.find((wager) => wager.dataset.wagerTarget === input.value),
    }));
  if (bets.length === 0) {
    resultElement.textContent = "Select at least one total and enter a wager for each.";
    return;
  }

  let invalidBet = false;
  bets.forEach(({ wagerInput }) => {
    const wager = Number(wagerInput.value);
    if (!Number.isInteger(wager) || wager < 1 || wager > maximumWager) {
      wagerInput.setCustomValidity(`Enter a whole-number wager between 1 and ${maximumWager} M-Points.`);
      invalidBet = true;
    } else {
      wagerInput.setCustomValidity("");
    }
  });
  if (invalidBet) {
    const invalidInput = bets.find(({ wagerInput }) => !wagerInput.checkValidity())?.wagerInput;
    invalidInput?.reportValidity();
    resultElement.textContent = `Each selected total needs a wager between 1 and ${maximumWager} M-Points.`;
    return;
  }

  const placedBets = bets.map(({ target, wagerInput }) => ({
    target,
    wager: Number(wagerInput.value),
  }));
  const totalWager = placedBets.reduce((sum, bet) => sum + bet.wager, 0);
  if (totalWager > credits) {
    resultElement.textContent = `Your selected wagers total ${totalWager} M-Points, but your balance is ${credits}. Lower one or more bets.`;
    return;
  }

  isRolling = true;
  updateBalance();
  rollButton.textContent = "Rolling…";
  dieElements.forEach((die) => die.classList.add("is-rolling"));
  rollAnimation = window.setTimeout(async () => {
    dieElements.forEach((die) => die.classList.remove("is-rolling"));
    try {
      const result = await window.MPrintPoints.rollDice(placedBets);
      showCompletedRoll(result, placedBets);
      await window.MPrintPoints.refreshProfile();
    } catch (error) {
      resultElement.textContent = `The roll couldn't be completed: ${error.message}`;
      try {
        applyProfile(await window.MPrintPoints.refreshProfile());
      } catch (profileError) {
        resultElement.textContent += ` Balance refresh failed: ${profileError.message}`;
      }
    } finally {
      isRolling = false;
      rollButton.textContent = "Roll the dice";
      updateBalance();
    }
  }, 420);
});

targetInputs.forEach((input) => {
  input.addEventListener("change", updateBalance);
});

wagerInputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.setCustomValidity("");
    updateBalance();
  });
});

dailyBonusButton.addEventListener("click", async () => {
  if (lastBonusDate === getTodayKey() || isRolling) {
    return;
  }

  dailyBonusButton.disabled = true;
  try {
    const result = await window.MPrintPoints.claimDailyBonus();
    const profile = await window.MPrintPoints.refreshProfile();
    resultElement.textContent = `Daily bonus claimed! You earned 25 M-Points. Your balance is ${profile?.points ?? result.points}.`;
  } catch (error) {
    resultElement.textContent = `The daily bonus couldn't be claimed: ${error.message}`;
    try {
      applyProfile(await window.MPrintPoints.refreshProfile());
    } catch (profileError) {
      resultElement.textContent += ` Balance refresh failed: ${profileError.message}`;
    }
  }
});

resetButton.addEventListener("click", () => {
  resetRoundState("New game started. Your M-Points balance is unchanged.");
});

window.addEventListener("m-points-updated", (event) => {
  applyProfile(event.detail.profile);
});

window.addEventListener("m-points-error", (event) => {
  resultElement.textContent = `M-Points couldn't be loaded: ${event.detail.error.message}`;
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    resetRoundState();
    window.MPrintPoints.refreshProfile().catch((error) => {
      resultElement.textContent = `M-Points couldn't be refreshed: ${error.message}`;
    });
  }
});

initializeGame();
