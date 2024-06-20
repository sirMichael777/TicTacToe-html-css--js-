const cells = document.querySelectorAll('[data-cell]');
const statusText = document.querySelector('.status-text');
const restartButton = document.querySelector('.restart-btn');
const quitButton = document.querySelector('.quit-btn');
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

startGame();

restartButton.addEventListener('click', startGame);
quitButton.addEventListener('click', quitGame);

function startGame() {
    oTurn = false;
    gameActive = true;
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

function quitGame() {
    gameActive = false;
    cells.forEach(cell => {
        cell.classList.remove(X_CLASS);
        cell.classList.remove(O_CLASS);
        cell.classList.remove('winner-animation');
        cell.removeEventListener('click', handleClick);
    });
    setStatusText('Game Quit');
}

function handleClick(e) {
    if (!gameActive) return;

    const cell = e.target;
    const currentClass = oTurn ? O_CLASS : X_CLASS;
    placeMark(cell, currentClass);
    if (checkWin(currentClass)) {
        endGame(false, currentClass);
    } else if (isDraw()) {
        endGame(true);
    } else {
        swapTurns();
        setBoardHoverClass();
        setStatusText(`Player ${oTurn ? 'O' : 'X'}'s turn`);
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
    } else {
        setStatusText(`Player ${oTurn ? 'O' : 'X'} Wins!`);
        WINNING_COMBINATIONS.forEach(combination => {
            if (combination.every(index => cells[index].classList.contains(currentClass))) {
                combination.forEach(index => cells[index].classList.add('winner-animation'));
            }
        });
    }
}

function isDraw() {
    return [...cells].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS);
    });
}

function setStatusText(message) {
    statusText.innerText = message;
}
