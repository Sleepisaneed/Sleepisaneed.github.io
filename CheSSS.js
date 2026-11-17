const boardElement = document.getElementById("chessboard");
const pieceGallery = document.getElementById("piece-gallery");
const statusElement = document.getElementById("chess-status");
const resetButton = document.getElementById("reset-chess");
const difficultySelect = document.getElementById("ai-difficulty");
const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
const HUMAN_COLOR = "light";
const AI_COLOR = "dark";
const AI_MOVE_DELAY_MS = 950;
const MATE_SCORE = 100000;
const pieceValues = { pawn: 100, knight: 320, bishop: 330, rook: 500, queen: 900, king: 20000 };
const pieceNames = {
  king: "King",
  queen: "Queen",
  rook: "Rook",
  bishop: "Bishop",
  knight: "Knight",
  pawn: "Pawn",
};

const backRank = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
let position = createStartingPosition();
let sideToMove = "light";
let enPassantTarget = null;
let selectedSquare = null;
let selectedMoves = [];
let gameOver = false;
let pointerGesture = null;
let dragGhost = null;
let aiMoveTimer = null;
let aiMoveAnimation = null;
let focusedSquare = { row: 7, column: 0 };
const squareElements = [];

function createStartingPosition() {
  const board = Array.from({ length: 8 }, () => Array(8).fill(null));
  backRank.forEach((type, column) => {
    board[0][column] = { type, color: "dark", hasMoved: false };
    board[1][column] = { type: "pawn", color: "dark", hasMoved: false };
    board[6][column] = { type: "pawn", color: "light", hasMoved: false };
    board[7][column] = { type, color: "light", hasMoved: false };
  });
  return board;
}

function createPieceIcon(piece, side, label = "") {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", `chess-piece chess-piece--${side}`);
  icon.setAttribute("viewBox", "0 0 16 16");
  icon.setAttribute("role", "img");
  icon.setAttribute("aria-label", label || `${side} ${pieceNames[piece]}`);
  icon.setAttribute("shape-rendering", "crispEdges");

  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#pixel-${piece}`);
  icon.appendChild(use);
  return icon;
}

function squareName(square) {
  return `${files[square.column]}${8 - square.row}`;
}

function sideName(side) {
  return side === "light" ? "Light" : "Dark";
}

function renderBoard(focus = null) {
  if (focus) focusedSquare = focus;
  boardElement.replaceChildren();
  boardElement.setAttribute("aria-label", `Chessboard. ${sideName(sideToMove)} to move.`);
  squareElements.length = 0;

  position.forEach((rank, rowIndex) => {
    const rankRow = document.createElement("div");
    rankRow.className = "chessboard-rank";
    rankRow.setAttribute("role", "row");
    squareElements[rowIndex] = [];

    rank.forEach((piece, columnIndex) => {
      const square = { row: rowIndex, column: columnIndex };
      const squareElement = document.createElement("div");
      const squareColor = (rowIndex + columnIndex) % 2 === 0 ? "light" : "dark";
      const legalMove = selectedMoves.find(
        (move) => move.to.row === rowIndex && move.to.column === columnIndex,
      );

      squareElement.className = `chess-square chess-square--${squareColor}`;
      squareElement.dataset.row = String(rowIndex);
      squareElement.dataset.column = String(columnIndex);
      squareElement.tabIndex =
        focusedSquare.row === rowIndex && focusedSquare.column === columnIndex ? 0 : -1;
      squareElement.setAttribute("role", "gridcell");
      squareElement.setAttribute(
        "aria-label",
        piece
          ? `${sideName(piece.color)} ${pieceNames[piece.type]} on ${squareName(square)}`
          : `Empty square ${squareName(square)}`,
      );

      if (selectedSquare?.row === rowIndex && selectedSquare.column === columnIndex) {
        squareElement.classList.add("is-selected");
      }
      if (legalMove) {
        squareElement.classList.add(
          position[rowIndex][columnIndex] || legalMove.enPassant
            ? "is-capture-destination"
            : "is-legal-destination",
        );
      }

      if (piece) {
        squareElement.appendChild(createPieceIcon(piece.type, piece.color));
      }

      squareElements[rowIndex][columnIndex] = squareElement;
      rankRow.appendChild(squareElement);
    });

    boardElement.appendChild(rankRow);
  });

  if (focus) {
    squareElements[focus.row][focus.column].focus({ preventScroll: true });
  }
}

function buildPieceGallery() {
  Object.entries(pieceNames).forEach(([piece, name]) => {
    const card = document.createElement("article");
    card.className = "piece-card";

    const heading = document.createElement("h4");
    heading.textContent = name;

    const art = document.createElement("div");
    art.className = "piece-card-art";
    art.appendChild(createPieceIcon(piece, "light", `Light ${name}`));
    art.appendChild(createPieceIcon(piece, "dark", `Dark ${name}`));

    const caption = document.createElement("p");
    caption.textContent = "Light side · Dark side";

    card.append(heading, art, caption);
    pieceGallery.appendChild(card);
  });
}

function isInsideBoard(row, column) {
  return row >= 0 && row < 8 && column >= 0 && column < 8;
}

function copyPosition(board) {
  return board.map((rank) => rank.map((piece) => piece ? { ...piece } : null));
}

function isSquareAttacked(board, targetRow, targetColumn, byColor) {
  const pawnDirection = byColor === "light" ? -1 : 1;
  const knightSteps = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];

  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const piece = board[row][column];
      if (!piece || piece.color !== byColor) continue;

      if (
        piece.type === "pawn" &&
        row + pawnDirection === targetRow &&
        Math.abs(column - targetColumn) === 1
      ) {
        return true;
      }

      if (
        piece.type === "knight" &&
        knightSteps.some(([rowStep, columnStep]) =>
          row + rowStep === targetRow && column + columnStep === targetColumn
        )
      ) {
        return true;
      }

      if (
        piece.type === "king" &&
        Math.max(Math.abs(row - targetRow), Math.abs(column - targetColumn)) === 1
      ) {
        return true;
      }

      const directions = [];
      if (piece.type === "rook" || piece.type === "queen") {
        directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }
      if (piece.type === "bishop" || piece.type === "queen") {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }

      for (const [rowStep, columnStep] of directions) {
        let nextRow = row + rowStep;
        let nextColumn = column + columnStep;
        while (isInsideBoard(nextRow, nextColumn)) {
          if (nextRow === targetRow && nextColumn === targetColumn) return true;
          if (board[nextRow][nextColumn]) break;
          nextRow += rowStep;
          nextColumn += columnStep;
        }
      }
    }
  }
  return false;
}

function findKing(board, color) {
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const piece = board[row][column];
      if (piece?.type === "king" && piece.color === color) return { row, column };
    }
  }
  return null;
}

function isInCheck(board, color) {
  const king = findKing(board, color);
  return !king || isSquareAttacked(board, king.row, king.column, color === "light" ? "dark" : "light");
}

function addMoveIfAvailable(board, moves, piece, from, row, column, details = {}) {
  if (!isInsideBoard(row, column)) return false;
  const target = board[row][column];
  if (target?.color === piece.color || target?.type === "king") return false;
  moves.push({ from, to: { row, column }, ...details });
  return !target;
}

function getPseudoMoves(board, from, enPassant) {
  const piece = board[from.row][from.column];
  if (!piece) return [];

  const moves = [];
  const enemyColor = piece.color === "light" ? "dark" : "light";
  const add = (row, column, details) =>
    addMoveIfAvailable(board, moves, piece, from, row, column, details);

  if (piece.type === "pawn") {
    const direction = piece.color === "light" ? -1 : 1;
    const startRow = piece.color === "light" ? 6 : 1;
    const promotionRow = piece.color === "light" ? 0 : 7;
    const nextRow = from.row + direction;

    if (isInsideBoard(nextRow, from.column) && !board[nextRow][from.column]) {
      add(nextRow, from.column, nextRow === promotionRow ? { promotion: "queen" } : {});
      const twoRows = from.row + direction * 2;
      if (from.row === startRow && !board[twoRows][from.column]) {
        add(twoRows, from.column, { doublePawn: true });
      }
    }

    for (const columnStep of [-1, 1]) {
      const targetRow = from.row + direction;
      const targetColumn = from.column + columnStep;
      if (!isInsideBoard(targetRow, targetColumn)) continue;
      const target = board[targetRow][targetColumn];
      if (target?.color === enemyColor && target.type !== "king") {
        add(targetRow, targetColumn, targetRow === promotionRow ? { promotion: "queen" } : {});
      } else if (
        enPassant?.row === targetRow &&
        enPassant.column === targetColumn &&
        board[from.row][targetColumn]?.type === "pawn" &&
        board[from.row][targetColumn]?.color === enemyColor
      ) {
        add(targetRow, targetColumn, { enPassant: true });
      }
    }
    return moves;
  }

  if (piece.type === "knight") {
    const steps = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    steps.forEach(([rowStep, columnStep]) => add(from.row + rowStep, from.column + columnStep));
    return moves;
  }

  if (piece.type === "king") {
    for (let rowStep = -1; rowStep <= 1; rowStep += 1) {
      for (let columnStep = -1; columnStep <= 1; columnStep += 1) {
        if (rowStep || columnStep) add(from.row + rowStep, from.column + columnStep);
      }
    }

    const homeRow = piece.color === "light" ? 7 : 0;
    if (
      !piece.hasMoved &&
      from.row === homeRow &&
      from.column === 4 &&
      !isSquareAttacked(board, homeRow, 4, enemyColor)
    ) {
      const kingRook = board[homeRow][7];
      if (
        kingRook?.type === "rook" &&
        kingRook.color === piece.color &&
        !kingRook.hasMoved &&
        !board[homeRow][5] &&
        !board[homeRow][6] &&
        !isSquareAttacked(board, homeRow, 5, enemyColor) &&
        !isSquareAttacked(board, homeRow, 6, enemyColor)
      ) {
        add(homeRow, 6, { castle: "king" });
      }

      const queenRook = board[homeRow][0];
      if (
        queenRook?.type === "rook" &&
        queenRook.color === piece.color &&
        !queenRook.hasMoved &&
        !board[homeRow][1] &&
        !board[homeRow][2] &&
        !board[homeRow][3] &&
        !isSquareAttacked(board, homeRow, 3, enemyColor) &&
        !isSquareAttacked(board, homeRow, 2, enemyColor)
      ) {
        add(homeRow, 2, { castle: "queen" });
      }
    }
    return moves;
  }

  const directions = [];
  if (piece.type === "rook" || piece.type === "queen") {
    directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
  }
  if (piece.type === "bishop" || piece.type === "queen") {
    directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }

  directions.forEach(([rowStep, columnStep]) => {
    let row = from.row + rowStep;
    let column = from.column + columnStep;
    while (add(row, column)) {
      row += rowStep;
      column += columnStep;
    }
  });
  return moves;
}

function applyMove(board, move) {
  const nextBoard = copyPosition(board);
  const piece = nextBoard[move.from.row][move.from.column];
  nextBoard[move.from.row][move.from.column] = null;

  if (move.enPassant) {
    nextBoard[move.from.row][move.to.column] = null;
  }

  if (move.castle) {
    const rookFromColumn = move.castle === "king" ? 7 : 0;
    const rookToColumn = move.castle === "king" ? 5 : 3;
    const rook = nextBoard[move.from.row][rookFromColumn];
    nextBoard[move.from.row][rookFromColumn] = null;
    nextBoard[move.from.row][rookToColumn] = { ...rook, hasMoved: true };
  }

  piece.hasMoved = true;
  if (move.promotion) piece.type = move.promotion;
  nextBoard[move.to.row][move.to.column] = piece;
  return nextBoard;
}

function getLegalMoves(board, from, enPassant = enPassantTarget) {
  const piece = board[from.row][from.column];
  if (!piece) return [];
  return getPseudoMoves(board, from, enPassant).filter((move) =>
    !isInCheck(applyMove(board, move), piece.color)
  );
}

function hasLegalMove(color) {
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const piece = position[row][column];
      if (piece?.color === color && getLegalMoves(position, { row, column }).length) {
        return true;
      }
    }
  }
  return false;
}

function selectSquare(square) {
  const piece = position[square.row][square.column];
  if (!piece || piece.color !== sideToMove || sideToMove !== HUMAN_COLOR || gameOver) return;

  selectedSquare = square;
  selectedMoves = getLegalMoves(position, square);
  focusedSquare = square;
  renderBoard(square);
  statusElement.textContent = selectedMoves.length
    ? `${sideName(piece.color)} ${pieceNames[piece.type]} selected. Choose a highlighted square.`
    : `${sideName(piece.color)} ${pieceNames[piece.type]} has no legal moves.`;
}

function clearSelection() {
  selectedSquare = null;
  selectedMoves = [];
}

function finishTurn(move) {
  const opponent = sideToMove;
  const checked = isInCheck(position, opponent);
  if (!hasLegalMove(opponent)) {
    gameOver = true;
    if (checked) {
      statusElement.textContent = `Checkmate! ${sideName(sideToMove === "light" ? "dark" : "light")} wins.`;
    } else {
      statusElement.textContent = "Stalemate. The game is a draw.";
    }
    return true;
  }

  const promotionMessage = move.promotion ? " Pawn promoted to a queen." : "";
  statusElement.textContent = checked
    ? `${sideName(opponent)} to move — check!${promotionMessage}`
    : `${sideName(opponent)} to move.${promotionMessage}`;
  return false;
}

function nextEnPassantTarget(move) {
  return move.doublePawn
    ? { row: (move.from.row + move.to.row) / 2, column: move.from.column }
    : null;
}

function getComputerMoveAnimation(move) {
  const piece = position[move.from.row][move.from.column];
  const fromSquare = squareElements[move.from.row][move.from.column];
  const toSquare = squareElements[move.to.row][move.to.column];
  if (!piece || !fromSquare || !toSquare) return null;

  const fromRect = fromSquare.getBoundingClientRect();
  const toRect = toSquare.getBoundingClientRect();
  return {
    piece,
    from: { left: fromRect.left, top: fromRect.top, width: fromRect.width, height: fromRect.height },
    to: { left: toRect.left, top: toRect.top },
    destination: move.to,
  };
}

function clearComputerMoveAnimation() {
  if (!aiMoveAnimation) return;
  clearTimeout(aiMoveAnimation.timeoutId);
  aiMoveAnimation.ghost.removeEventListener("transitionend", aiMoveAnimation.finish);
  aiMoveAnimation.ghost.remove();
  aiMoveAnimation.destination.classList.remove("is-ai-move-target");
  aiMoveAnimation = null;
}

function animateComputerMove(animationData) {
  clearComputerMoveAnimation();
  const destination = squareElements[animationData.destination.row][animationData.destination.column];
  const ghost = document.createElement("div");
  ghost.className = "chess-ai-move-ghost";
  ghost.style.left = `${animationData.from.left}px`;
  ghost.style.top = `${animationData.from.top}px`;
  ghost.style.width = `${animationData.from.width}px`;
  ghost.style.height = `${animationData.from.height}px`;
  ghost.appendChild(createPieceIcon(animationData.piece.type, animationData.piece.color));

  const animation = { ghost, destination, timeoutId: null, finish: null };
  animation.finish = () => {
    if (aiMoveAnimation === animation) clearComputerMoveAnimation();
  };
  aiMoveAnimation = animation;
  destination.classList.add("is-ai-move-target");
  document.body.appendChild(ghost);
  ghost.addEventListener("transitionend", animation.finish);
  ghost.getBoundingClientRect();
  requestAnimationFrame(() => {
    if (aiMoveAnimation !== animation) return;
    ghost.style.transform =
      `translate(${animationData.to.left - animationData.from.left}px, ${animationData.to.top - animationData.from.top}px)`;
  });
  animation.timeoutId = setTimeout(animation.finish, 600);
}

function getAllLegalMoves(board, color, enPassant = enPassantTarget) {
  const moves = [];
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      if (board[row][column]?.color === color) {
        moves.push(...getLegalMoves(board, { row, column }, enPassant));
      }
    }
  }
  return moves;
}

function evaluatePosition(board, perspective) {
  let score = 0;
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const piece = board[row][column];
      if (!piece) continue;

      const sign = piece.color === perspective ? 1 : -1;
      let value = pieceValues[piece.type];
      if (piece.type === "pawn") {
        value += (piece.color === "light" ? 6 - row : row - 1) * 7;
      } else if (piece.type === "knight" || piece.type === "bishop" || piece.type === "queen") {
        value += Math.max(0, 3.5 - (Math.abs(3.5 - row) + Math.abs(3.5 - column)) / 2) * 8;
      }
      score += sign * value;
    }
  }
  return score;
}

function orderMoves(board, moves) {
  return moves.sort((left, right) => movePriority(board, right) - movePriority(board, left));
}

function movePriority(board, move) {
  const attacker = board[move.from.row][move.from.column];
  const victim = move.enPassant
    ? { type: "pawn" }
    : board[move.to.row][move.to.column];
  let priority = victim ? pieceValues[victim.type] * 10 - pieceValues[attacker.type] : 0;
  if (move.promotion) priority += pieceValues[move.promotion];
  if (move.castle) priority += 40;
  return priority;
}

function negamax(board, color, depth, alpha, beta, enPassant) {
  const moves = getAllLegalMoves(board, color, enPassant);
  if (moves.length === 0) {
    return isInCheck(board, color) ? -MATE_SCORE - depth : 0;
  }
  if (depth === 0) return evaluatePosition(board, color);

  let bestScore = -Infinity;
  for (const move of orderMoves(board, moves)) {
    const score = -negamax(
      applyMove(board, move),
      color === "light" ? "dark" : "light",
      depth - 1,
      -beta,
      -alpha,
      nextEnPassantTarget(move),
    );
    bestScore = Math.max(bestScore, score);
    alpha = Math.max(alpha, score);
    if (alpha >= beta) break;
  }
  return bestScore;
}

function chooseComputerMove() {
  const moves = getAllLegalMoves(position, AI_COLOR);
  if (!moves.length) return null;

  const difficulty = difficultySelect.value;
  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === "hard" ? 3 : 2;
  let bestScore = -Infinity;
  let bestMoves = [];
  let alpha = -Infinity;

  for (const move of orderMoves(position, moves)) {
    const score = -negamax(
      applyMove(position, move),
      HUMAN_COLOR,
      depth - 1,
      -Infinity,
      -alpha,
      nextEnPassantTarget(move),
    );
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
    alpha = Math.max(alpha, score);
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function commitMove(move) {
  const mover = sideToMove;
  const animationData = mover === AI_COLOR ? getComputerMoveAnimation(move) : null;
  position = applyMove(position, move);
  enPassantTarget = nextEnPassantTarget(move);
  sideToMove = sideToMove === "light" ? "dark" : "light";
  clearSelection();
  focusedSquare = move.to;
  renderBoard(move.to);
  if (animationData) animateComputerMove(animationData);

  const gameFinished = finishTurn(move);
  if (!gameFinished && mover === HUMAN_COLOR && sideToMove === AI_COLOR) {
    scheduleComputerMove();
  }
}

function scheduleComputerMove() {
  if (aiMoveTimer !== null) clearTimeout(aiMoveTimer);
  statusElement.textContent = `Dark computer (${difficultySelect.value}) is thinking…`;
  aiMoveTimer = setTimeout(() => {
    aiMoveTimer = null;
    if (gameOver || sideToMove !== AI_COLOR) return;

    const move = chooseComputerMove();
    if (!move) {
      gameOver = true;
      statusElement.textContent = "The computer has no legal moves.";
      return;
    }
    commitMove(move);
  }, AI_MOVE_DELAY_MS);
}

function attemptMove(from, to) {
  if (gameOver || !selectedSquare) return false;
  const move = selectedMoves.find(
    (candidate) => candidate.to.row === to.row && candidate.to.column === to.column,
  );

  if (!move) {
    const piece = position[from.row][from.column];
    const origin = squareName(from);
    clearSelection();
    focusedSquare = from;
    renderBoard(from);
    statusElement.textContent = piece
      ? `Illegal move. ${sideName(piece.color)} ${pieceNames[piece.type]} stays on ${origin}.`
      : "Illegal move. The piece stays where it was.";
    return false;
  }

  commitMove(move);
  return true;
}

function getSquareFromTarget(target) {
  return target?.closest?.(".chess-square") || null;
}

function squareFromElement(element) {
  if (!element) return null;
  return {
    row: Number(element.dataset.row),
    column: Number(element.dataset.column),
  };
}

function removeDragGhost() {
  dragGhost?.remove();
  dragGhost = null;
  if (pointerGesture) {
    squareElements[pointerGesture.from.row][pointerGesture.from.column]?.classList.remove("is-lifted");
  }
}

function updateDragGhost(event) {
  if (!dragGhost) return;
  dragGhost.style.left = `${event.clientX}px`;
  dragGhost.style.top = `${event.clientY}px`;
}

function startDragGhost(event) {
  if (dragGhost || !pointerGesture) return;
  const piece = position[pointerGesture.from.row][pointerGesture.from.column];
  if (!piece) return;

  dragGhost = document.createElement("div");
  dragGhost.className = "chess-drag-ghost";
  dragGhost.appendChild(createPieceIcon(piece.type, piece.color));
  document.body.appendChild(dragGhost);
  squareElements[pointerGesture.from.row][pointerGesture.from.column].classList.add("is-lifted");
  updateDragGhost(event);
}

function handlePointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  const squareElement = getSquareFromTarget(event.target);
  const square = squareFromElement(squareElement);
  if (!square || gameOver) return;
  if (aiMoveAnimation) {
    statusElement.textContent = "The computer's move is finishing. Please wait.";
    return;
  }
  if (sideToMove !== HUMAN_COLOR) {
    statusElement.textContent = "The computer is thinking. Wait for its move.";
    return;
  }

  const piece = position[square.row][square.column];
  if (piece?.color === sideToMove) {
    selectSquare(square);
    pointerGesture = {
      from: square,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      startedOnPiece: true,
    };
  } else if (selectedSquare) {
    pointerGesture = {
      from: selectedSquare,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      startedOnPiece: false,
    };
  } else {
    statusElement.textContent = `${sideName(sideToMove)} to move. Select one of your pieces.`;
    return;
  }

  focusedSquare = square;
  event.preventDefault();
  if (boardElement.setPointerCapture) boardElement.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!pointerGesture) return;
  const distance = Math.hypot(
    event.clientX - pointerGesture.startX,
    event.clientY - pointerGesture.startY,
  );
  if (distance > 8) {
    pointerGesture.moved = true;
    startDragGhost(event);
    updateDragGhost(event);
  }
}

function handlePointerUp(event) {
  if (!pointerGesture) return;
  const gesture = pointerGesture;
  const releaseTarget = document.elementFromPoint
    ? document.elementFromPoint(event.clientX, event.clientY)
    : event.target;
  const destination = squareFromElement(getSquareFromTarget(releaseTarget));

  removeDragGhost();
  pointerGesture = null;

  if (gesture.moved) {
    if (destination) {
      attemptMove(gesture.from, destination);
    } else {
      clearSelection();
      renderBoard(gesture.from);
      statusElement.textContent = "Move cancelled. The piece stays on its square.";
    }
    return;
  }

  if (gesture.startedOnPiece) return;
  if (destination) attemptMove(gesture.from, destination);
}

function handlePointerCancel() {
  if (!pointerGesture) return;
  const origin = pointerGesture.from;
  removeDragGhost();
  pointerGesture = null;
  renderBoard(origin);
}

function handleBoardKeyDown(event) {
  const square = squareFromElement(getSquareFromTarget(event.target));
  if (!square) return;

  const directions = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
  };
  if (directions[event.key]) {
    event.preventDefault();
    const [rowStep, columnStep] = directions[event.key];
    const row = Math.max(0, Math.min(7, square.row + rowStep));
    const column = Math.max(0, Math.min(7, square.column + columnStep));
    focusedSquare = { row, column };
    squareElements[row][column].tabIndex = 0;
    squareElements[square.row][square.column].tabIndex = -1;
    squareElements[row][column].focus();
    return;
  }

  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  if (sideToMove !== HUMAN_COLOR || aiMoveAnimation) return;
  const piece = position[square.row][square.column];
  if (piece?.color === sideToMove) {
    selectSquare(square);
  } else if (selectedSquare) {
    attemptMove(selectedSquare, square);
  }
}

function resetGame() {
  if (aiMoveTimer !== null) clearTimeout(aiMoveTimer);
  aiMoveTimer = null;
  clearComputerMoveAnimation();
  position = createStartingPosition();
  sideToMove = "light";
  enPassantTarget = null;
  gameOver = false;
  pointerGesture = null;
  clearSelection();
  focusedSquare = { row: 7, column: 0 };
  removeDragGhost();
  renderBoard();
  statusElement.textContent = "Light to move. You play Light; the computer plays Dark.";
}

function buildPieceGallery() {
  Object.entries(pieceNames).forEach(([piece, name]) => {
    const card = document.createElement("article");
    card.className = "piece-card";

    const heading = document.createElement("h4");
    heading.textContent = name;

    const art = document.createElement("div");
    art.className = "piece-card-art";
    art.appendChild(createPieceIcon(piece, "light", `Light ${name}`));
    art.appendChild(createPieceIcon(piece, "dark", `Dark ${name}`));

    const caption = document.createElement("p");
    caption.textContent = "Light side · Dark side";

    card.append(heading, art, caption);
    pieceGallery.appendChild(card);
  });
}

boardElement.addEventListener("pointerdown", handlePointerDown);
boardElement.addEventListener("pointermove", handlePointerMove);
boardElement.addEventListener("pointerup", handlePointerUp);
boardElement.addEventListener("pointercancel", handlePointerCancel);
boardElement.addEventListener("lostpointercapture", handlePointerCancel);
boardElement.addEventListener("keydown", handleBoardKeyDown);
resetButton.addEventListener("click", resetGame);
difficultySelect.addEventListener("change", () => {
  resetGame();
  const difficulty = difficultySelect.value;
  statusElement.textContent =
    `${difficulty[0].toUpperCase()}${difficulty.slice(1)} difficulty selected. New game started. Light to move.`;
});

buildPieceGallery();
resetGame();
