/* jshint loopfunc: true */
// 遊戲狀態變數
let gameBoard = Array(9).fill(null);
let currentPlayer = 'X';
let isGameActive = true;
const AI_PLAYER = 'O';
const HUMAN_PLAYER = 'X';

// 獲勝組合
const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫排
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // 直行
    [0, 4, 8], [2, 4, 6]  // 對角線
];

/**
 * 初始化遊戲板和狀態
 */
function initGame() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';
    gameBoard = Array(9).fill(null);
    isGameActive = true;
    currentPlayer = HUMAN_PLAYER;
    document.getElementById('status').innerText = '玩家 (X) 先手';

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i; // 使用 data 屬性存儲索引
        cell.onclick = () => handlePlayerMove(i);
        boardEl.appendChild(cell);
    }
    // 移除勝利高亮和狀態動畫
    clearWinHighlight();
    // ** [已刪除] ** 移除勝利線條相關程式碼
    document.getElementById('status').classList.remove('status-flash');
}

/**
 * 處理玩家移動
 * @param {number} index 點擊的格子索引
 */
function handlePlayerMove(index) {
    if (!isGameActive) return;

    if (gameBoard[index]) {
        // 禁手點擊視覺回饋 (新增)
        const cell = document.getElementsByClassName('cell')[index];
        cell.classList.add('shake-disabled');
        setTimeout(() => cell.classList.remove('shake-disabled'), 500);
        return;
    }

    gameBoard[index] = HUMAN_PLAYER;
    updateBoardUI();

    const winCombo = checkWin(HUMAN_PLAYER);
    if (winCombo) {
        endGame('玩家 (X) 勝利！', winCombo);
        return;
    } else if (isBoardFull()) {
        endGame('平手！');
        return;
    }

    currentPlayer = AI_PLAYER;
    document.getElementById('status').innerText = '電腦思考中...';

    // 增加電腦思考延遲 (UX 改善)
    setTimeout(handleComputerMove, 700); 
}

/**
 * 處理電腦移動
 */
function handleComputerMove() {
    if (!isGameActive) return;
    
    const moveIndex = findBestMove();
    
    if (moveIndex !== null) {
        gameBoard[moveIndex] = AI_PLAYER;
        updateBoardUI();

        const winCombo = checkWin(AI_PLAYER);
        if (winCombo) {
            endGame('電腦 (O) 勝利！', winCombo);
            return;
        } else if (isBoardFull()) {
            endGame('平手！');
            return;
        }
    }

    currentPlayer = HUMAN_PLAYER;
    document.getElementById('status').innerText = '輪到玩家 (X)';
}

// --- Minimax 核心演算法 (不變) ---
function findBestMove() {
    let bestScore = -Infinity;
    let move = null;
    for (let i = 0; i < 9; i++) {
        if (gameBoard[i] === null) {
            gameBoard[i] = AI_PLAYER;
            let score = minimax(gameBoard, 0, false); 
            gameBoard[i] = null; 
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

function minimax(boardState, depth, isMaximizer) {
    const winnerO = checkWin(AI_PLAYER, boardState);
    const winnerX = checkWin(HUMAN_PLAYER, boardState);
    
    if (winnerO) return 10 - depth; 
    if (winnerX) return depth - 10; 
    if (isBoardFull(boardState)) return 0; 

    if (isMaximizer) { 
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === null) {
                boardState[i] = AI_PLAYER;
                best = Math.max(best, minimax(boardState, depth + 1, false));
                boardState[i] = null;
            }
        }
        return best;
    } else { 
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
            if (boardState[i] === null) {
                boardState[i] = HUMAN_PLAYER;
                best = Math.min(best, minimax(boardState, depth + 1, true));
                boardState[i] = null;
            }
        }
        return best;
    }
}

// --- 遊戲工具函數 ---

function updateBoardUI() {
    const cells = document.getElementsByClassName('cell');
    for (let i = 0; i < 9; i++) {
        const cell = cells[i];
        cell.innerText = gameBoard[i] || '';
        cell.classList.remove(HUMAN_PLAYER, AI_PLAYER, "draw-anim");
        
        if (gameBoard[i]) {
            cell.classList.add("draw-anim");
            cell.classList.add(gameBoard[i]); 
        }
    }
}

function checkWin(player, boardToCheck = gameBoard) {
    for (let combo of WINNING_COMBOS) {
        let [a, b, c] = combo;
        if (boardToCheck[a] === player && boardToCheck[b] === player && boardToCheck[c] === player) {
            return combo;
        }
    }
    return null;
}

function isBoardFull(boardToCheck = gameBoard) {
    return boardToCheck.every(cell => cell !== null);
}

/**
 * 結束遊戲並顯示結果
 */
function endGame(msg, winCombo = null) {
    document.getElementById('status').innerText = msg;
    isGameActive = false;
    
    // 狀態訊息動畫 (新增)
    document.getElementById('status').classList.add('status-flash');

    if (winCombo) {
        highlightWinCombo(winCombo);
        // ** [已刪除] ** 呼叫 drawWinLine(winCombo);
    }
}

function highlightWinCombo(combo) {
    const cells = document.getElementsByClassName('cell');
    combo.forEach(index => {
        cells[index].classList.add('winning-cell');
    });
}

function clearWinHighlight() {
    const cells = document.getElementsByClassName('cell');
    Array.from(cells).forEach(cell => {
        cell.classList.remove('winning-cell');
    });
}

// ** [已刪除] ** 整個 drawWinLine 函式 (不再需要)

function resetGame() {
    initGame();
}

// 啟動遊戲
document.addEventListener('DOMContentLoaded', initGame);