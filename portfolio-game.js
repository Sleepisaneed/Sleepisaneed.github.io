const flappyCanvas = document.getElementById("flappy-canvas");
const flappyCtx = flappyCanvas.getContext("2d");
const arrowCanvas = document.getElementById("arrow-canvas");
const arrowCtx = arrowCanvas.getContext("2d");
const reactionCanvas = document.getElementById("reaction-canvas");
const reactionCtx = reactionCanvas.getContext("2d");
const snakeCanvas = document.getElementById("snake-canvas");
const snakeCtx = snakeCanvas.getContext("2d");

const scoreEl = document.getElementById("game-score");
const bestEl = document.getElementById("game-best");
const arrowScoreEl = document.getElementById("arrow-score");
const arrowStreakEl = document.getElementById("arrow-streak");
const reactionScoreEl = document.getElementById("reaction-score");
const reactionBestEl = document.getElementById("reaction-best");
const snakeEl = document.getElementById("snake-score");
const snakeBestEl = document.getElementById("snake-best");
const resetBtn = document.getElementById("game-reset-btn");
const prevBtn = document.getElementById("game-prev-btn");
const nextBtn = document.getElementById("game-next-btn");
const slides = [...document.querySelectorAll(".game-slide")];

const directions = ["↑", "↓", "←", "→"];
const keyMap = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
};

let currentGameIndex = 0;
let flappyLoopId = null;
let arrowLoopId = null;
let snakeLoopId = null;
let reactionTimer = null;

let flappyState = {
  running: false,
  bird: {
    x: 74,
    y: flappyCanvas.height / 2 - 12,
    radius: 14,
    velocity: 0,
    rotation: 0,
  },
  pipes: [],
  score: 0,
  best: Number(localStorage.getItem("flappy-best") || 0),
  frame: 0,
};

let arrowState = {
  arrows: [],
  score: 0,
  streak: 0,
  spawnTimer: 0,
};

let reactionState = {
  phase: "waiting",
  score: 0,
  best: Number(localStorage.getItem("reaction-best") || 0),
  countDown: 3,
  timeLeft: 0,
  roundLength: 10,
  startedAt: 0,
};

let snakeState = {
  running: false,
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  snake: [],
  food: { x: 0, y: 0 },
  score: 0,
  best: Number(localStorage.getItem("snake-best") || 0),
};

function setActiveGame(index) {
  currentGameIndex = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentGameIndex);
  });

  if (currentGameIndex === 0) {
    flappyState.running = false;
    renderFlappy();
  } else if (currentGameIndex === 1) {
    cancelAnimationFrame(arrowLoopId);
    startArrowGame();
  } else if (currentGameIndex === 2) {
    clearTimeout(reactionTimer);
    startReactionGame();
  } else if (currentGameIndex === 3) {
    clearTimeout(snakeLoopId);
    startSnakeGame();
  }
}

function resetFlappyGame() {
  flappyState = {
    running: false,
    bird: {
      x: 74,
      y: flappyCanvas.height / 2 - 12,
      radius: 14,
      velocity: 0,
      rotation: 0,
    },
    pipes: [],
    score: 0,
    best: Number(localStorage.getItem("flappy-best") || 0),
    frame: 0,
  };

  scoreEl.textContent = "0";
  bestEl.textContent = String(flappyState.best);
  renderFlappy();
}

function renderFlappy() {
  flappyCtx.clearRect(0, 0, flappyCanvas.width, flappyCanvas.height);
  flappyCtx.fillStyle = "#0a2337";
  flappyCtx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);
  flappyCtx.fillStyle = "#153f5a";
  flappyCtx.fillRect(0, flappyCanvas.height - 52, flappyCanvas.width, 52);

  flappyState.pipes.forEach((pipe) => {
    const topHeight = pipe.topHeight;
    const bottomY = topHeight + pipe.gap;
    flappyCtx.fillStyle = "#2d9d78";
    flappyCtx.fillRect(pipe.x, 0, pipe.width, topHeight);
    flappyCtx.fillRect(
      pipe.x,
      bottomY,
      pipe.width,
      flappyCanvas.height - bottomY,
    );
    flappyCtx.fillStyle = "#1c6a57";
    flappyCtx.fillRect(pipe.x - 4, topHeight - 18, pipe.width + 8, 18);
    flappyCtx.fillRect(pipe.x - 4, bottomY, pipe.width + 8, 18);
  });

  flappyCtx.save();
  flappyCtx.translate(flappyState.bird.x, flappyState.bird.y);
  flappyCtx.rotate(flappyState.bird.rotation);
  flappyCtx.fillStyle = "#ffb347";
  flappyCtx.beginPath();
  flappyCtx.arc(0, 0, flappyState.bird.radius, 0, Math.PI * 2);
  flappyCtx.fill();

  flappyCtx.fillStyle = "#ffe2d7";
  flappyCtx.beginPath();
  flappyCtx.arc(4, -4, 4, 0, Math.PI * 2);
  flappyCtx.fill();

  flappyCtx.fillStyle = "#020d1a";
  flappyCtx.beginPath();
  flappyCtx.arc(5, -4, 2, 0, Math.PI * 2);
  flappyCtx.fill();

  flappyCtx.strokeStyle = "#ff7f50";
  flappyCtx.lineWidth = 2;
  flappyCtx.beginPath();
  flappyCtx.moveTo(flappyState.bird.radius - 1, 2);
  flappyCtx.lineTo(flappyState.bird.radius + 9, 8);
  flappyCtx.stroke();
  flappyCtx.restore();

  if (!flappyState.running) {
    flappyCtx.fillStyle = "rgba(2, 13, 26, 0.38)";
    flappyCtx.fillRect(0, 0, flappyCanvas.width, flappyCanvas.height);
    flappyCtx.fillStyle = "#ffe2d7";
    flappyCtx.font = "bold 28px Arial";
    flappyCtx.textAlign = "center";
    flappyCtx.fillText(
      "Click to fly",
      flappyCanvas.width / 2,
      flappyCanvas.height / 2 - 10,
    );
    flappyCtx.font = "bold 16px Arial";
    flappyCtx.fillText(
      "Space or tap to jump",
      flappyCanvas.width / 2,
      flappyCanvas.height / 2 + 20,
    );
  }
}

function startFlappyGame() {
  cancelAnimationFrame(flappyLoopId);
  resetFlappyGame();
  flappyState.running = true;
  flappyState.bird.velocity = -7.3;
  runFlappyLoop();
}

function flapBird() {
  if (currentGameIndex !== 0) {
    return;
  }

  if (!flappyState.running) {
    startFlappyGame();
    return;
  }

  flappyState.bird.velocity = -7.3;
}

function endFlappyGame() {
  flappyState.running = false;
  if (flappyState.score > flappyState.best) {
    flappyState.best = flappyState.score;
    localStorage.setItem("flappy-best", String(flappyState.best));
    bestEl.textContent = String(flappyState.best);
  }
  renderFlappy();
}

function runFlappyLoop() {
  if (currentGameIndex !== 0) {
    return;
  }

  if (flappyState.running) {
    flappyState.bird.velocity += 0.45;
    flappyState.bird.y += flappyState.bird.velocity;
    flappyState.bird.rotation = Math.min(
      Math.PI / 2,
      flappyState.bird.velocity / 12,
    );

    flappyState.frame += 1;
    if (flappyState.frame % 110 === 0) {
      const minTop = 50;
      const maxTop = flappyCanvas.height - 170;
      const topHeight = minTop + Math.random() * (maxTop - minTop);
      flappyState.pipes.push({
        x: flappyCanvas.width + 54,
        width: 54,
        topHeight,
        gap: 124,
        scored: false,
      });
    }

    for (const pipe of flappyState.pipes) {
      pipe.x -= 2.2;

      if (!pipe.scored && pipe.x + pipe.width < flappyState.bird.x) {
        pipe.scored = true;
        flappyState.score += 1;
        scoreEl.textContent = String(flappyState.score);
        if (flappyState.score > flappyState.best) {
          flappyState.best = flappyState.score;
          localStorage.setItem("flappy-best", String(flappyState.best));
          bestEl.textContent = String(flappyState.best);
        }
      }

      const birdLeft = flappyState.bird.x - flappyState.bird.radius;
      const birdRight = flappyState.bird.x + flappyState.bird.radius;
      const birdTop = flappyState.bird.y - flappyState.bird.radius;
      const birdBottom = flappyState.bird.y + flappyState.bird.radius;

      const hitsTopPipe =
        birdRight > pipe.x &&
        birdLeft < pipe.x + pipe.width &&
        birdTop < pipe.topHeight;
      const hitsBottomPipe =
        birdRight > pipe.x &&
        birdLeft < pipe.x + pipe.width &&
        birdBottom > pipe.topHeight + pipe.gap;

      if (
        hitsTopPipe ||
        hitsBottomPipe ||
        birdTop <= 0 ||
        birdBottom >= flappyCanvas.height
      ) {
        endFlappyGame();
        return;
      }
    }

    flappyState.pipes = flappyState.pipes.filter(
      (pipe) => pipe.x + pipe.width > -20,
    );
    renderFlappy();
    flappyLoopId = requestAnimationFrame(runFlappyLoop);
  }
}

function renderArrowGame() {
  arrowCtx.clearRect(0, 0, arrowCanvas.width, arrowCanvas.height);
  arrowCtx.fillStyle = "#0a2337";
  arrowCtx.fillRect(0, 0, arrowCanvas.width, arrowCanvas.height);
  arrowCtx.fillStyle = "#1c3c5a";
  arrowCtx.fillRect(0, arrowCanvas.height - 52, arrowCanvas.width, 52);

  const laneWidth = arrowCanvas.width / 4;
  const targetRow = arrowCanvas.height - 68;

  for (let i = 0; i < 4; i += 1) {
    const laneX = i * laneWidth;
    arrowCtx.fillStyle = "rgba(255,255,255,0.08)";
    arrowCtx.fillRect(laneX, 0, 2, arrowCanvas.height);
    arrowCtx.fillStyle = "#ffe2d7";
    arrowCtx.font = "bold 22px Arial";
    arrowCtx.textAlign = "center";
    arrowCtx.fillText(
      directions[i],
      laneX + laneWidth / 2,
      arrowCanvas.height - 18,
    );
  }

  arrowCtx.strokeStyle = "#ffb347";
  arrowCtx.lineWidth = 2;
  arrowCtx.beginPath();
  arrowCtx.moveTo(0, targetRow);
  arrowCtx.lineTo(arrowCanvas.width, targetRow);
  arrowCtx.stroke();

  arrowState.arrows.forEach((arrow) => {
    arrowCtx.font = "bold 30px Arial";
    arrowCtx.textAlign = "center";
    arrowCtx.fillStyle = "#ffb347";
    arrowCtx.fillText(arrow.symbol, arrow.x, arrow.y);
  });

  arrowCtx.font = "bold 16px Arial";
  arrowCtx.textAlign = "center";
  arrowCtx.fillStyle = "#ffe2d7";
  arrowCtx.fillText("Match the falling arrow", arrowCanvas.width / 2, 28);
}

function resetArrowGame() {
  arrowState = {
    arrows: [],
    score: 0,
    streak: 0,
    spawnTimer: 0,
  };
  arrowScoreEl.textContent = "0";
  arrowStreakEl.textContent = "0";
  renderArrowGame();
}

function startArrowGame() {
  cancelAnimationFrame(arrowLoopId);
  resetArrowGame();
  arrowLoop();
}

function arrowLoop() {
  if (currentGameIndex !== 1) {
    return;
  }

  arrowState.spawnTimer += 1;
  if (arrowState.spawnTimer >= 55) {
    arrowState.spawnTimer = 0;
    const symbol = directions[Math.floor(Math.random() * directions.length)];
    const lane = directions.indexOf(symbol);
    arrowState.arrows.push({
      symbol,
      x: lane * (arrowCanvas.width / 4) + arrowCanvas.width / 8,
      y: -10,
      speed: 2 + Math.random() * 1.3,
    });
  }

  arrowState.arrows = arrowState.arrows.filter((arrow) => {
    arrow.y += arrow.speed;

    if (arrow.y > arrowCanvas.height - 68) {
      if (arrowState.streak > 0) {
        arrowState.streak = 0;
        arrowStreakEl.textContent = "0";
      }
      return false;
    }

    return true;
  });

  renderArrowGame();
  arrowLoopId = requestAnimationFrame(arrowLoop);
}

function handleArrowPress(event) {
  const mapped = keyMap[event.key];
  if (!mapped || currentGameIndex !== 1) {
    return;
  }

  const hitLine = arrowCanvas.height - 68;
  const matchingArrow = arrowState.arrows.find((arrow) => {
    return arrow.symbol === mapped && Math.abs(arrow.y - hitLine) < 28;
  });

  if (matchingArrow) {
    arrowState.arrows = arrowState.arrows.filter(
      (arrow) => arrow !== matchingArrow,
    );
    arrowState.score += 1;
    arrowState.streak += 1;
    arrowScoreEl.textContent = String(arrowState.score);
    arrowStreakEl.textContent = String(arrowState.streak);
  } else {
    arrowState.streak = 0;
    arrowStreakEl.textContent = "0";
  }
}

function renderReactionGame() {
  reactionCtx.clearRect(0, 0, reactionCanvas.width, reactionCanvas.height);
  reactionCtx.fillStyle = "#0a2337";
  reactionCtx.fillRect(0, 0, reactionCanvas.width, reactionCanvas.height);
  reactionCtx.fillStyle = "#1d3f5d";
  reactionCtx.fillRect(0, reactionCanvas.height - 42, reactionCanvas.width, 42);

  if (reactionState.phase === "waiting") {
    reactionCtx.fillStyle = "#ffe2d7";
    reactionCtx.font = "bold 24px Arial";
    reactionCtx.textAlign = "center";
    reactionCtx.fillText(
      "Click to start",
      reactionCanvas.width / 2,
      reactionCanvas.height / 2 - 12,
    );
    reactionCtx.font = "bold 18px Arial";
    reactionCtx.fillText(
      "3-second countdown",
      reactionCanvas.width / 2,
      reactionCanvas.height / 2 + 22,
    );
    return;
  }

  if (reactionState.phase === "countdown") {
    reactionCtx.fillStyle = "#ffb347";
    reactionCtx.fillRect(
      35,
      35,
      reactionCanvas.width - 70,
      reactionCanvas.height - 70,
    );
    reactionCtx.fillStyle = "#0a2337";
    reactionCtx.font = "bold 72px Arial";
    reactionCtx.textAlign = "center";
    reactionCtx.fillText(
      String(Math.max(1, Math.ceil(reactionState.countDown))),
      reactionCanvas.width / 2,
      reactionCanvas.height / 2 + 20,
    );
    return;
  }

  if (reactionState.phase === "active") {
    reactionCtx.fillStyle = "#60d394";
    reactionCtx.fillRect(
      35,
      35,
      reactionCanvas.width - 70,
      reactionCanvas.height - 70,
    );
    reactionCtx.fillStyle = "#0a2337";
    reactionCtx.font = "bold 28px Arial";
    reactionCtx.textAlign = "center";
    reactionCtx.fillText(
      "CLICK!",
      reactionCanvas.width / 2,
      reactionCanvas.height / 2 - 10,
    );
    reactionCtx.font = "bold 18px Arial";
    reactionCtx.fillText(
      `Time: ${reactionState.timeLeft.toFixed(1)}s`,
      reactionCanvas.width / 2,
      reactionCanvas.height / 2 + 22,
    );
    return;
  }

  reactionCtx.fillStyle = "#ff7f50";
  reactionCtx.fillRect(
    30,
    30,
    reactionCanvas.width - 60,
    reactionCanvas.height - 60,
  );
  reactionCtx.fillStyle = "#0a2337";
  reactionCtx.font = "bold 30px Arial";
  reactionCtx.textAlign = "center";
  reactionCtx.fillText(
    "Time's up!",
    reactionCanvas.width / 2,
    reactionCanvas.height / 2 - 10,
  );
  reactionCtx.font = "bold 18px Arial";
  reactionCtx.fillText(
    `Score: ${reactionState.score}`,
    reactionCanvas.width / 2,
    reactionCanvas.height / 2 + 18,
  );
}

function startReactionGame() {
  clearInterval(reactionTimer);
  reactionState = {
    phase: "waiting",
    score: 0,
    best: Number(localStorage.getItem("reaction-best") || 0),
    countDown: 3,
    timeLeft: 0,
    roundLength: 10,
    startedAt: 0,
  };
  reactionScoreEl.textContent = "0";
  reactionBestEl.textContent = String(reactionState.best);
  renderReactionGame();
}

function startReactionCountdown() {
  reactionState.phase = "countdown";
  reactionState.countDown = 3;
  reactionState.startedAt = Date.now();
  reactionState.timeLeft = reactionState.roundLength;
  renderReactionGame();

  reactionTimer = setInterval(() => {
    if (currentGameIndex !== 2) {
      clearInterval(reactionTimer);
      return;
    }

    if (reactionState.phase === "countdown") {
      const elapsed = (Date.now() - reactionState.startedAt) / 1000;
      const nextValue = Math.max(0, 3 - elapsed);
      reactionState.countDown = nextValue;

      if (nextValue <= 0) {
        reactionState.phase = "active";
        reactionState.startedAt = Date.now();
        reactionState.timeLeft = reactionState.roundLength;
        renderReactionGame();
        return;
      }

      renderReactionGame();
      return;
    }

    if (reactionState.phase === "active") {
      reactionState.timeLeft = Math.max(
        0,
        reactionState.roundLength -
          (Date.now() - reactionState.startedAt) / 1000,
      );

      if (reactionState.timeLeft <= 0) {
        clearInterval(reactionTimer);
        reactionState.phase = "ended";
        reactionState.timeLeft = 0;

        if (reactionState.score > reactionState.best) {
          reactionState.best = reactionState.score;
          localStorage.setItem("reaction-best", String(reactionState.best));
          reactionBestEl.textContent = String(reactionState.best);
        }

        renderReactionGame();
      }
    }
  }, 80);
}

function resetReactionGame() {
  clearInterval(reactionTimer);
  reactionState = {
    phase: "waiting",
    score: 0,
    best: Number(localStorage.getItem("reaction-best") || 0),
    countDown: 3,
    timeLeft: 0,
    roundLength: 10,
    startedAt: 0,
  };
  reactionScoreEl.textContent = "0";
  reactionBestEl.textContent = String(reactionState.best);
  renderReactionGame();
}

function handleReactionClick() {
  if (currentGameIndex !== 2) {
    return;
  }

  if (reactionState.phase === "waiting") {
    startReactionCountdown();
    return;
  }

  if (reactionState.phase === "countdown") {
    return;
  }

  if (reactionState.phase === "active") {
    reactionState.score += 1;
    reactionScoreEl.textContent = String(reactionState.score);

    if (reactionState.score > reactionState.best) {
      reactionState.best = reactionState.score;
      localStorage.setItem("reaction-best", String(reactionState.best));
      reactionBestEl.textContent = String(reactionState.best);
    }

    return;
  }

  if (reactionState.phase === "ended") {
    startReactionGame();
  }
}

function snakeCellSize() {
  return 20;
}

function placeSnakeFood() {
  const columns = snakeCanvas.width / snakeCellSize();
  const rows = snakeCanvas.height / snakeCellSize();
  let food;

  do {
    food = {
      x: Math.floor(Math.random() * columns),
      y: Math.floor(Math.random() * rows),
    };
  } while (
    snakeState.snake.some(
      (segment) => segment.x === food.x && segment.y === food.y,
    )
  );

  snakeState.food = food;
}

function renderSnakeGame() {
  const cellSize = snakeCellSize();
  snakeCtx.fillStyle = "#0a2337";
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  snakeCtx.strokeStyle = "rgba(255, 226, 215, 0.08)";
  snakeCtx.lineWidth = 1;

  for (let x = 0; x <= snakeCanvas.width; x += cellSize) {
    snakeCtx.beginPath();
    snakeCtx.moveTo(x, 0);
    snakeCtx.lineTo(x, snakeCanvas.height);
    snakeCtx.stroke();
  }
  for (let y = 0; y <= snakeCanvas.height; y += cellSize) {
    snakeCtx.beginPath();
    snakeCtx.moveTo(0, y);
    snakeCtx.lineTo(snakeCanvas.width, y);
    snakeCtx.stroke();
  }

  snakeCtx.fillStyle = "#ff7f50";
  snakeCtx.fillRect(
    snakeState.food.x * cellSize + 3,
    snakeState.food.y * cellSize + 3,
    cellSize - 6,
    cellSize - 6,
  );

  snakeState.snake.forEach((segment, index) => {
    snakeCtx.fillStyle = index === 0 ? "#60d394" : "#2d9d78";
    snakeCtx.fillRect(
      segment.x * cellSize + 2,
      segment.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4,
    );
  });

  if (!snakeState.running) {
    snakeCtx.fillStyle = "rgba(2, 13, 26, 0.52)";
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
    snakeCtx.fillStyle = "#ffe2d7";
    snakeCtx.font = "bold 26px Arial";
    snakeCtx.textAlign = "center";
    snakeCtx.fillText(
      "Click or press an arrow",
      snakeCanvas.width / 2,
      snakeCanvas.height / 2 - 8,
    );
    snakeCtx.font = "bold 16px Arial";
    snakeCtx.fillText(
      "Eat the Mangoes",
      snakeCanvas.width / 2,
      snakeCanvas.height / 2 + 22,
    );
  }
}

function resetSnakeGame() {
  snakeState = {
    running: false,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    snake: [
      { x: 10, y: 7 },
      { x: 9, y: 7 },
      { x: 8, y: 7 },
    ],
    food: { x: 15, y: 7 },
    score: 0,
    best: Number(localStorage.getItem("snake-best") || 0),
  };
  snakeEl.textContent = "0";
  snakeBestEl.textContent = String(snakeState.best);
  renderSnakeGame();
}

function startSnakeGame() {
  clearTimeout(snakeLoopId);
  resetSnakeGame();
  snakeState.running = true;
  runSnakeLoop();
}

function endSnakeGame() {
  snakeState.running = false;
  if (snakeState.score > snakeState.best) {
    snakeState.best = snakeState.score;
    localStorage.setItem("snake-best", String(snakeState.best));
    snakeBestEl.textContent = String(snakeState.best);
  }
  renderSnakeGame();
}

function runSnakeLoop() {
  if (currentGameIndex !== 3 || !snakeState.running) {
    renderSnakeGame();
    return;
  }

  snakeState.direction = snakeState.nextDirection;
  const head = snakeState.snake[0];
  const nextHead = {
    x: head.x + snakeState.direction.x,
    y: head.y + snakeState.direction.y,
  };
  const columns = snakeCanvas.width / snakeCellSize();
  const rows = snakeCanvas.height / snakeCellSize();
  const hitWall =
    nextHead.x < 0 ||
    nextHead.x >= columns ||
    nextHead.y < 0 ||
    nextHead.y >= rows;
  const hitSelf = snakeState.snake.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
  );

  if (hitWall || hitSelf) {
    endSnakeGame();
    return;
  }

  snakeState.snake.unshift(nextHead);
  if (nextHead.x === snakeState.food.x && nextHead.y === snakeState.food.y) {
    snakeState.score += 1;
    snakeEl.textContent = String(snakeState.score);
    if (snakeState.score > snakeState.best) {
      snakeState.best = snakeState.score;
      localStorage.setItem("snake-best", String(snakeState.best));
      snakeBestEl.textContent = String(snakeState.best);
    }
    placeSnakeFood();
  } else {
    snakeState.snake.pop();
  }

  renderSnakeGame();
  snakeLoopId = setTimeout(() => requestAnimationFrame(runSnakeLoop), 115);
}

function handleSnakeDirection(event) {
  if (currentGameIndex !== 3) {
    return;
  }

  const requested = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  }[event.key];

  if (
    !requested ||
    (requested.x === -snakeState.direction.x &&
      requested.y === -snakeState.direction.y)
  ) {
    return;
  }

  event.preventDefault();
  if (!snakeState.running) {
    startSnakeGame();
  }
  snakeState.nextDirection = requested;
}

function resetCurrentGame() {
  if (currentGameIndex === 0) {
    startFlappyGame();
  } else if (currentGameIndex === 1) {
    startArrowGame();
  } else if (currentGameIndex === 2) {
    resetReactionGame();
  } else if (currentGameIndex === 3) {
    startSnakeGame();
  }
}

function handleCanvasClick() {
  if (currentGameIndex === 0) {
    if (!flappyState.running) {
      startFlappyGame();
    } else {
      flapBird();
    }
  }

  if (currentGameIndex === 2) {
    handleReactionClick();
  }

  if (currentGameIndex === 3 && !snakeState.running) {
    startSnakeGame();
  }
}

flappyCanvas.addEventListener("click", handleCanvasClick);
reactionCanvas.addEventListener("click", handleCanvasClick);
snakeCanvas.addEventListener("click", handleCanvasClick);
window.addEventListener("keydown", (event) => {
  if (event.code === "Space" && currentGameIndex === 0) {
    event.preventDefault();
    flapBird();
  }

  if (currentGameIndex === 1) {
    handleArrowPress(event);
  }

  handleSnakeDirection(event);
});

prevBtn.addEventListener("click", () => setActiveGame(currentGameIndex - 1));
nextBtn.addEventListener("click", () => setActiveGame(currentGameIndex + 1));
resetBtn.addEventListener("click", resetCurrentGame);

prevBtn.title = "Previous game";
nextBtn.title = "Next game";

setActiveGame(0);
resetFlappyGame();
renderArrowGame();
renderReactionGame();
resetSnakeGame();
