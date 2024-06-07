let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let playerXScore = 0;
let playerOScore = 0;
let moveHistory = [];
let singlePlayer = false;
let gameInterval;

function startGame() {
  const playerXNameInput = document.getElementById('playerXNameInput').value || 'Player X';
  const playerONameInput = document.getElementById('playerONameInput').value || 'Player O';

  document.getElementById('playerXName').textContent = playerXNameInput;
  document.getElementById('playerOName').textContent = playerONameInput;

  document.getElementById('playerInputs').style.display = 'none';
  document.getElementById('scoreboard').style.display = 'block';

  resetGame();
}

function handleClick(index) {
  const clickSound = document.getElementById('clickSound');
  const winSound = document.getElementById('winSound');
  const drawSound = document.getElementById('drawSound');

  if (gameBoard[index] === '' && !checkWin() && !checkDraw()) {
    gameBoard[index] = currentPlayer;
    moveHistory.push(index);
    clickSound.play();
    render();
    if (checkWin()) {
      const winCombination = getWinningCombination();
      highlightWinningCells(winCombination);
      setTimeout(() => {
        winSound.play();
        alert(currentPlayer + ' wins!');
        updateScore();
        resetGame();
      }, 1000);
    } else if (checkDraw()) {
      drawSound.play();
      setTimeout(() => {
        alert('It\'s a draw!');
        resetGame();
      }, 1000);
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      if (singlePlayer && currentPlayer === 'O') {
        setTimeout(aiMove, 500);
      }
    }
  }
}

function aiMove() {
  const difficulty = document.getElementById('difficulty').value;
  let index;
  if (difficulty === 'easy') {
    index = getBestMoveEasy();
  } else if (difficulty === 'medium') {
    index = getBestMoveMedium();
  } else {
    index = getBestMoveHard();
  }
  handleClick(index);
}

function getBestMoveEasy() {
  const availableMoves = gameBoard.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getBestMoveMedium() {
  const moves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
  return moves.find(index => gameBoard[index] === '');
}

function getBestMoveHard() {
  return minimax(gameBoard, currentPlayer).index;
}

function minimax(newBoard, player) {
  const availSpots = newBoard.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);

  if (checkWinForPlayer(newBoard, 'X')) {
    return { score: -10 };
  } else if (checkWinForPlayer(newBoard, 'O')) {
    return { score: 10 };
  } else if (availSpots.length === 0) {
    return { score: 0 };
  }

  const moves = [];
  for (let i = 0; i < availSpots.length; i++) {
    const move = {};
    move.index = availSpots[i];
    newBoard[availSpots[i]] = player;

    if (player === 'O') {
      const result = minimax(newBoard, 'X');
      move.score = result.score;
    } else {
      const result = minimax(newBoard, 'O');
      move.score = result.score;
    }

    newBoard[availSpots[i]] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === 'O') {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
}

function render() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach((cell, index) => {
    cell.textContent = gameBoard[index];
  });
}

function checkWin() {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  return winConditions.some(combination => {
    const [a, b, c] = combination;
    return gameBoard[a] !== '' && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c];
  });
}

function checkWinForPlayer(board, player) {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  return winConditions.some(combination => {
    const [a, b, c] = combination;
    return board[a] === player && board[b] === player && board[c] === player;
  });
}

function getWinningCombination() {
  const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const combination of winConditions) {
    const [a, b, c] = combination;
    if (gameBoard[a] !== '' && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
      return combination;
    }
  }

  return null;
}

function highlightWinningCells(combination) {
  combination.forEach(index => {
    const cell = document.querySelector(`.cell:nth-child(${index + 1})`);
    cell.classList.add('winner');
  });
}

function checkDraw() {
  return gameBoard.every(cell => cell !== '');
}

function resetGame() {
  clearInterval(gameInterval);
  currentPlayer = 'X';
  gameBoard = ['', '', '', '', '', '', '', '', ''];
  moveHistory = [];
  clearHighlight();
  render();
  startTimer();
}

function clearHighlight() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.classList.remove('winner');
  });
}

function updateScore() {
  if (currentPlayer === 'X') {
    playerXScore++;
    document.getElementById('playerXScore').textContent = playerXScore;
  } else {
    playerOScore++;
    document.getElementById('playerOScore').textContent = playerOScore;
  }
}

function undoMove() {
  if (moveHistory.length > 0) {
    const lastMove = moveHistory.pop();
    gameBoard[lastMove] = '';
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    render();
  }
}

function setPlayerNames() {
  const playerXNameInput = document.getElementById('playerXNameInput').value || 'Player X';
  const playerONameInput = document.getElementById('playerONameInput').value || 'Player O';

  document.getElementById('playerXName').textContent = playerXNameInput;
  document.getElementById('playerOName').textContent = playerONameInput;
}

function toggleSinglePlayer() {
  singlePlayer = !singlePlayer;
  resetGame();
}

function startTimer() {
  let startTime = Date.now();
  const timerElement = document.getElementById('timer');

  gameInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);

    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

function setTheme() {
  const theme = document.getElementById('theme').value;
  document.body.className = `${theme}-theme`;
}
