/* jshint loopfunc: true */
let board = Array(9).fill(null);
let current = 'X';
let active = true;

function init() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    board = Array(9).fill(null);
    active = true;
    current = 'X';
    document.getElementById('status').innerText = '玩家 (X) 先手';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.onclick = () => playerMove(i);
        boardEl.appendChild(cell);
    }
}

function playerMove(i) {
    if (!active || board[i]) return;

    board[i] = 'X';
    updateBoard();

    const winCombo = checkWin('X');
    if (winCombo) {
        endGame('玩家 (X) 勝利！');
        return;
    } else if (isFull()) {
        endGame('平手！');
        return;
    }

    current = 'O';
    document.getElementById('status').innerText = '電腦思考中...';

    setTimeout(computerMove, 50); // 快速思考
}

function computerMove() {
    const move = getBestMove();
    board[move] = 'O';
    updateBoard();

    const winCombo = checkWin('O');
    if (winCombo) {
        endGame('電腦 (O) 勝利！');
        return;
    } else if (isFull()) {
        endGame('平手！');
        return;
    }

    current = 'X';
    document.getElementById('status').innerText = '輪到玩家 (X)';
}

// Minimax AI 永不輸
function getBestMove() {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = 'O';
            let score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(bd, depth, isMaximizing) {
    const winnerO = checkWin('O');
    const winnerX = checkWin('X');
    if (winnerO) return 10 - depth;
    if (winnerX) return depth - 10;
    if (bd.every(c => c !== null)) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (bd[i] === null) {
                bd[i] = 'O';
                best = Math.max(best, minimax(bd, depth + 1, false));
                bd[i] = null;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (bd[i] === null) {
                bd[i] = 'X';
                best = Math.min(best, minimax(bd, depth + 1, true));
                bd[i] = null;
            }
        }
        return best;
    }
}

function updateBoard() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < 9; i++) {
        cells[i].innerText = board[i] || '';

        // 移除舊的 X/O class
        cells[i].classList.remove("X", "O", "draw-anim");

        if (board[i]) {
            cells[i].classList.add("draw-anim");
            cells[i].classList.add(board[i]); // 根據 X/O 加顏色 class
        }
    }
}


function checkWin(player) {
    const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    for (let win of wins) {
        let [a,b,c] = win;
        if (board[a] === player && board[b] === player && board[c] === player) return win;
    }
    return null;
}

function isFull() {
    return board.every(c => c !== null);
}

function endGame(msg) {
    document.getElementById('status').innerText = msg;
    active = false;
}

function resetGame() {
    init();
}

init();

