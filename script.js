const cells = document.querySelectorAll('[data-cell]');
const statusText = document.querySelector('.status-text');
const scoreText = document.querySelector('.score-text');
const roundText = document.querySelector('.round-text');
const restartButtons = document.querySelectorAll('.restart-btn');
const quitButtons = document.querySelectorAll('.quit-btn');
const modeButtons = document.querySelectorAll('.mode-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const roundConfirmButton = document.querySelector('.round-confirm-btn');
const gameContainer = document.querySelector('.game-container');
const modeSelection = document.querySelector('.mode-selection');
const difficultySelection = document.querySelector('.difficulty-selection');
const roundSelection = document.querySelector('.round-selection');
const computerThinking = document.querySelector('.computer-thinking');
const overlay = document.querySelector('.overlay');
const resultOverlay = document.querySelector('.result-overlay');
const resultText = document.querySelector('.result-text');
const roundsInput = document.getElementById('rounds-input');
const roundUnlimitedButton = document.querySelector('[data-rounds="unlimited"]');
const X_CLASS = 'x';
const O_CLASS = 'o';
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

let oTurn;
let gameActive = true;
let isComputerOpponent = false;
let difficultyLevel = 'easy'; // Default difficulty level
let rounds = 1;
let currentRound = 0;
let scores = { X: 0, O: 0 };

modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        isComputerOpponent = button.dataset.mode === 'computer';
        modeSelection.style.display = 'none';
        roundSelection.style.display = 'flex';
    });
});

difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        difficultyLevel = button.dataset.difficulty;
        difficultySelection.style.display = 'none';
        gameContainer.style.display = 'flex';
        startGame();
    });
});

roundConfirmButton.addEventListener('click', () => {
    rounds = parseInt(roundsInput.value, 10);
    if (isNaN(rounds) || rounds <= 0) {
        rounds = Infinity;
    }
    roundSelection.style.display = 'none';
    if (isComputerOpponent) {
        difficultySelection.style.display = 'flex';
    } else {
        gameContainer.style.display = 'flex';
        startGame();
    }
});

roundUnlimitedButton.addEventListener('click', () => {
    rounds = Infinity;
    roundSelection.style.display = 'none';
    if (isComputerOpponent) {
        difficultySelection.style.display = 'flex';
    } else {
        gameContainer.style.display = 'flex';
        startGame();
    }
});

restartButtons.forEach(button => button.addEventListener('click', resetGame));
quitButtons.forEach(button => button.addEventListener('click', quitGame));

function startGame() {
    if (currentRound >= rounds) {
        showOverallResults();
        resetScores(); // Reset scores after all rounds are completed
        return;
    }

    oTurn = false;
    gameActive = true;
    currentRound++;
    updateRoundText();
    updateScoreboard(); // Ensure scoreboard is updated at the start of each round
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winner-animation');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
    setBoardHoverClass();
    setStatusText(`Player X's turn`);
}

function resetGame() {
    resetScores();
    currentRound = 0;
    resultOverlay.style.display = 'none'; // Hide result overlay
    gameContainer.style.display = 'none';
    modeSelection.style.display = 'flex';
}

function quitGame() {
    resetScores();
    gameActive = false;
    currentRound = 0;  // Reset the current round
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winner-animation');
        cell.removeEventListener('click', handleClick);
    });
    gameContainer.style.display = 'none';
    resultOverlay.style.display = 'none'; // Hide result overlay
    modeSelection.style.display = 'flex';
}

function handleClick(e) {
    if (!gameActive) return;

    const cell = e.target;
    const currentClass = oTurn ? O_CLASS : X_CLASS;
    if (cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)) {
        return; // Prevent clicking on occupied cell
    }
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false, currentClass);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
        setStatusText(`Player ${oTurn ? 'O' : 'X'}'s turn`);
        if (isComputerOpponent && oTurn) {
            showComputerThinking();
            setTimeout(() => {
                computerMove();
                hideComputerThinking();
            }, 2000);  // Delay for computer move
        }
    }
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass);
}

function swapTurns() {
    oTurn = !oTurn;
}

function setBoardHoverClass() {
    document.querySelector('.game-board').classList.remove(X_CLASS);
    document.querySelector('.game-board').classList.remove(O_CLASS);
    if (oTurn) {
        document.querySelector('.game-board').classList.add(O_CLASS);
    } else {
        document.querySelector('.game-board').classList.add(X_CLASS);
    }
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cells[index].classList.contains(currentClass);
        });
    });
}

function endGame(draw, currentClass) {
    gameActive = false;
    if (draw) {
        setStatusText(`Draw!`);
        scores.X++;
        scores.O++;
    } else {
        setStatusText(`Player ${currentClass === X_CLASS ? 'X' : 'O'} Wins!`);
        if (currentClass === X_CLASS) {
            scores.X++;
        } else {
            scores.O++;
        }
    }
    console.log(`Scores updated: X = ${scores.X}, O = ${scores.O}`); // Debugging statement
    updateScoreboard();
    WINNING_COMBINATIONS.forEach(combination => {
        if (combination.every(index => cells[index].classList.contains(currentClass))) {
            combination.forEach(index => cells[index].classList.add('winner-animation'));
        }
    });

    setTimeout(startGame, 2000); // Delay before starting next round
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function setStatusText(message) {
    statusText.innerText = message;
}

function updateScoreboard() {
    scoreText.innerText = `Player X: ${scores.X} - Player O: ${scores.O}`;
    console.log(`Scoreboard updated: Player X: ${scores.X} - Player O: ${scores.O}`); // Debugging statement
}

function updateRoundText() {
    roundText.innerText = `Round ${currentRound} of ${rounds === Infinity ? 'Unlimited' : rounds}`;
}

function showComputerThinking() {
    overlay.style.display = 'block';
    computerThinking.style.display = 'flex';
}

function hideComputerThinking() {
    overlay.style.display = 'none';
    computerThinking.style.display = 'none';
}

function computerMove() {
    if (!gameActive) return;

    let move;
    if (difficultyLevel === 'easy') {
        move = getRandomMove();
    } else if (difficultyLevel === 'medium') {
        move = getMediumMove();
    } else if (difficultyLevel === 'hard') {
        move = getBestMove(O_CLASS);
    }

    if (move !== null) {
        placeMark(cells[move], O_CLASS);
        if (checkWin(O_CLASS)) {
            endGame(false, O_CLASS);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            setBoardHoverClass();
            setStatusText(`Player X's turn`);
        }
    }
}

function getRandomMove() {
    const availableCells = [...cells].filter(cell => {
        return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS);
    });
    const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
    return randomCell ? Array.from(cells).indexOf(randomCell) : null;
}

function getMediumMove() {
    // Basic logic to block player or win if possible
    for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (cells[a].classList.contains(O_CLASS) && cells[b].classList.contains(O_CLASS) && !cells[c].classList.contains(X_CLASS) && !cells[c].classList.contains(O_CLASS)) {
            return c;
        }
        if (cells[a].classList.contains(O_CLASS) && cells[c].classList.contains(O_CLASS) && !cells[b].classList.contains(X_CLASS) && !cells[b].classList.contains(O_CLASS)) {
            return b;
        }
        if (cells[b].classList.contains(O_CLASS) && cells[c].classList.contains(O_CLASS) && !cells[a].classList.contains(X_CLASS) && !cells[a].classList.contains(O_CLASS)) {
            return a;
        }
        if (cells[a].classList.contains(X_CLASS) && cells[b].classList.contains(X_CLASS) && !cells[c].classList.contains(X_CLASS) && !cells[c].classList.contains(O_CLASS)) {
            return c;
        }
        if (cells[a].classList.contains(X_CLASS) && cells[c].classList.contains(X_CLASS) && !cells[b].classList.contains(X_CLASS) && !cells[b].classList.contains(O_CLASS)) {
            return b;
        }
        if (cells[b].classList.contains(X_CLASS) && cells[c].classList.contains(X_CLASS) && !cells[a].classList.contains(X_CLASS) && !cells[a].classList.contains(O_CLASS)) {
            return a;
        }
    }
    return getRandomMove();
}

function getBestMove(currentClass) {
    // Minimax algorithm for the hard mode
    const opponentClass = currentClass === X_CLASS ? O_CLASS : X_CLASS;
    let bestScore = -Infinity;
    let bestMove;

    cells.forEach((cell, index) => {
        if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
            cell.classList.add(currentClass);
            const score = minimax(cells, 0, false, currentClass, opponentClass);
            cell.classList.remove(currentClass);
            if (score > bestScore) {
                bestScore = score;
                bestMove = index;
            }
        }
    });
    return bestMove;
}

function minimax(newCells, depth, isMaximizing, currentClass, opponentClass) {
    const scores = {
        [O_CLASS]: 10,
        [X_CLASS]: -10,
        draw: 0
    };

    const result = checkWin(currentClass) ? currentClass : checkWin(opponentClass) ? opponentClass : isDraw() ? 'draw' : null;
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        newCells.forEach(cell => {
            if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
                cell.classList.add(currentClass);
                const score = minimax(newCells, depth + 1, false, currentClass, opponentClass);
                cell.classList.remove(currentClass);
                bestScore = Math.max(score, bestScore);
            }
        });
        return bestScore;
    } else {
        let bestScore = Infinity;
        newCells.forEach(cell => {
            if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
                cell.classList.add(opponentClass);
                const score = minimax(newCells, depth + 1, true, currentClass, opponentClass);
                cell.classList.remove(opponentClass);
                bestScore = Math.min(score, bestScore);
            }
        });
        return bestScore;
    }
}

function showOverallResults() {
    const winner = scores.X > scores.O ? 'Player X' : scores.X < scores.O ? 'Player O' : 'No one';
    resultText.innerHTML = `Game Over! ${winner} wins!<br>Final Score:<br>Player X: ${scores.X}<br>Player O: ${scores.O}`;
    resultOverlay.style.display = 'flex';
}

function resetScores() {
    scores = { X: 0, O: 0 };
    updateScoreboard();
}
