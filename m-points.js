(() => {
  const storageKey = "mprint-dice-game";
  const oldAccountStorageKey = "mprint-local-player-data-v1";
  const startingPoints = 100;
  const dailyBonusPoints = 25;
  const maximumWager = 25;
  const validTargets = new Set([2, 3, 4, 5, 6, 8, 9, 10, 12]);
  const balanceElements = document.querySelectorAll("[data-m-points]");
  let currentGame = null;

  function announce() {
    window.dispatchEvent(new CustomEvent("m-points-updated", {
      detail: { profile: getProfile() },
    }));
  }

  function parseSavedGame(serialized) {
    let game;
    try {
      game = JSON.parse(serialized);
    } catch {
      throw new Error("Saved M-Points could not be read. This browser's game data may be damaged.");
    }

    if (
      !game
      || !Number.isSafeInteger(game.credits)
      || game.credits < 0
      || !(typeof game.lastBonusDate === "string" || game.lastBonusDate === null)
    ) {
      throw new Error("Saved M-Points are invalid. Clear this site's saved data to start a new game.");
    }

    return {
      credits: game.credits,
      lastBonusDate: game.lastBonusDate || "",
    };
  }

  function migrateLocalAccount() {
    const serializedAccounts = localStorage.getItem(oldAccountStorageKey);
    if (serializedAccounts === null) {
      return { credits: startingPoints, lastBonusDate: "" };
    }

    let database;
    try {
      database = JSON.parse(serializedAccounts);
    } catch {
      throw new Error("Old local account data could not be read, so M-Points were not migrated.");
    }

    const players = database?.players;
    const currentPlayer = database?.currentUsername && players?.[database.currentUsername];
    const onlyPlayer = players && Object.keys(players).length === 1
      ? Object.values(players)[0]
      : null;
    const player = currentPlayer || onlyPlayer;
    if (!player) {
      return { credits: startingPoints, lastBonusDate: "" };
    }

    if (
      !Number.isSafeInteger(player.points)
      || player.points < 0
      || !(player.dailyBonusClaimedOn === null || typeof player.dailyBonusClaimedOn === "string")
    ) {
      throw new Error("The previous local account's M-Points are invalid and could not be migrated.");
    }

    return {
      credits: player.points,
      lastBonusDate: player.dailyBonusClaimedOn || "",
    };
  }

  function loadGame() {
    const serializedGame = localStorage.getItem(storageKey);
    if (serializedGame !== null) {
      return parseSavedGame(serializedGame);
    }

    const game = migrateLocalAccount();
    localStorage.setItem(storageKey, JSON.stringify(game));
    localStorage.removeItem(oldAccountStorageKey);
    return game;
  }

  function saveGame(game) {
    if (!Number.isSafeInteger(game.credits) || game.credits < 0) {
      throw new Error("M-Points balance must be a non-negative whole number.");
    }

    localStorage.setItem(storageKey, JSON.stringify(game));
    currentGame = game;
    updateBalance();
    announce();
  }

  function getProfile() {
    if (!currentGame) {
      return null;
    }

    return {
      points: currentGame.credits,
      daily_bonus_claimed_on: currentGame.lastBonusDate || null,
    };
  }

  function updateBalance() {
    const credits = currentGame?.credits ?? startingPoints;
    balanceElements.forEach((element) => {
      element.textContent = String(credits);
    });
  }

  function getTodayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function rollDie() {
    if (!window.crypto?.getRandomValues) {
      throw new Error("Secure dice rolls are unavailable in this browser.");
    }

    const limit = Math.floor(0x100000000 / 6) * 6;
    const value = new Uint32Array(1);
    do {
      window.crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return (value[0] % 6) + 1;
  }

  async function initialize() {
    currentGame = loadGame();
    localStorage.removeItem(oldAccountStorageKey);
    updateBalance();
  }

  const ready = initialize().catch((error) => {
    balanceElements.forEach((element) => {
      element.textContent = "Unavailable";
    });
    window.dispatchEvent(new CustomEvent("m-points-error", { detail: { error } }));
    throw error;
  });

  window.MPrintPoints = {
    ready,
    getProfile,
    refreshProfile: async () => {
      await ready;
      currentGame = loadGame();
      updateBalance();
      return getProfile();
    },
    rollDice: async (bets) => {
      await ready;
      const game = loadGame();
      if (!Array.isArray(bets) || bets.length < 1 || bets.length > validTargets.size) {
        throw new Error("Choose between 1 and 9 totals to bet on.");
      }

      const targets = new Set();
      let totalWager = 0;
      for (const bet of bets) {
        if (!validTargets.has(bet.target) || targets.has(bet.target)) {
          throw new Error("Each valid total can only be bet on once.");
        }
        if (!Number.isSafeInteger(bet.wager) || bet.wager < 1 || bet.wager > maximumWager) {
          throw new Error("Each wager must be between 1 and 25 M-Points.");
        }
        targets.add(bet.target);
        totalWager += bet.wager;
      }
      if (totalWager > game.credits) {
        throw new Error("Your selected wagers exceed your M-Points balance.");
      }

      const dieOne = rollDie();
      const dieTwo = rollDie();
      const total = dieOne + dieTwo;
      const winningBet = bets.find((bet) => bet.target === total);
      const doubles = dieOne === dieTwo;
      let payout = 0;
      if (total !== 7 && total !== 11 && winningBet) {
        const waysToRollTarget = 6 - Math.abs(7 - winningBet.target);
        payout = winningBet.wager * Math.round(12 / waysToRollTarget) * (doubles ? 2 : 1);
      }

      game.credits = game.credits - totalWager + payout;
      saveGame(game);
      return {
        dieOne,
        dieTwo,
        total,
        points: game.credits,
        totalWager,
        payout,
        winningTarget: winningBet?.target ?? null,
        doubles,
        gameOver: total === 7 || total === 11,
      };
    },
    claimDailyBonus: async () => {
      await ready;
      const game = loadGame();
      const today = getTodayKey();
      if (game.lastBonusDate === today) {
        throw new Error("Today's daily bonus has already been claimed.");
      }

      game.credits += dailyBonusPoints;
      game.lastBonusDate = today;
      saveGame(game);
      return { points: game.credits, dailyBonusClaimedOn: today };
    },
  };

  ready.catch(() => {});

  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      currentGame = loadGame();
      updateBalance();
      announce();
    }
  });
  window.addEventListener("pageshow", () => {
    if (currentGame) {
      currentGame = loadGame();
      updateBalance();
    }
  });
})();
