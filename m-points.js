(() => {
  const storageKey = "mprint-dice-game";
  const startingPoints = 100;
  const balanceElements = document.querySelectorAll("[data-m-points]");

  function load() {
    const savedGame = localStorage.getItem(storageKey);
    if (savedGame === null) {
      return { credits: startingPoints, lastBonusDate: "" };
    }

    const parsedGame = JSON.parse(savedGame);
    if (
      !parsedGame
      || !Number.isSafeInteger(parsedGame.credits)
      || parsedGame.credits < 0
      || typeof parsedGame.lastBonusDate !== "string"
    ) {
      throw new Error("Saved M-Points data is invalid. Clear this site's saved data to start a new game.");
    }

    return parsedGame;
  }

  function updateBalance() {
    const { credits } = load();
    balanceElements.forEach((element) => {
      element.textContent = String(credits);
    });
  }

  function save(game) {
    localStorage.setItem(storageKey, JSON.stringify(game));
    window.dispatchEvent(new Event("m-points-updated"));
  }

  window.MPrintPoints = { load, save };
  updateBalance();

  window.addEventListener("m-points-updated", updateBalance);
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey) {
      updateBalance();
    }
  });
  window.addEventListener("pageshow", updateBalance);
})();
