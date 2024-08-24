// Utility function to get a random integer between min and max
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate a sequence of tetrominoes in random order
function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    tetrominoSequence.length = 0; // Clear the array
    while (sequence.length) {
        const rand = getRandomInt(0, sequence.length - 1);
        const name = sequence.splice(rand, 1)[0];
        tetrominoSequence.push(name);
    }
}

// Get the next tetromino from the sequence
function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
        generateSequence();
    }

    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];

    const col = Math.floor(playfield[0].length / 2) - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;

    return {
        name: name,
        matrix: matrix,
        row: row,
        col: col
    };
}

// Rotate the matrix 90 degrees clockwise
function rotate(matrix) {
    const N = matrix.length - 1;
    return matrix.map((row, i) =>
        row.map((val, j) => matrix[N - j][i])
    );
}

// Check if the tetromino's move is valid
function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (matrix[row][col] && (
                cellCol + col < 0 ||
                cellCol + col >= playfield[0].length ||
                cellRow + row >= playfield.length ||
                playfield[cellRow + row][cellCol + col])
            ) {
                return false;
            }
        }
    }
    return true;
}

// Place the tetromino on the playfield and handle line clearing
function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                if (tetromino.row + row < 0) {
                    return showGameOver();
                }
                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }

    let linesCleared = 0;
    for (let row = playfield.length - 1; row >= 0;) {
        if (playfield[row].every(cell => !!cell)) {
            linesCleared++;
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r - 1][c];
                }
            }
        } else {
            row--;
        }
    }

    if (linesCleared > 0) {
        const points = linesCleared * 100;  // 100 points per line cleared
        updateScore(points);
    }

    tetromino = getNextTetromino();
}

// Update the score display
function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Show the game over screen and stop the game loop
function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
    document.getElementById('game-over').style.display = 'block';
}

// Set up the canvas and playfield
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 32;
const tetrominoSequence = [];
const playfield = [];
for (let row = -2; row < 20; row++) {
    playfield[row] = [];
    for (let col = 0; col < 10; col++) {
        playfield[row][col] = 0;
    }
}

// Define the tetromino shapes and colors
const tetrominos = {
    'I': [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    'J': [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    'L': [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    'O': [[1, 1], [1, 1]],
    'S': [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    'Z': [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    'T': [[0, 1, 0], [1, 1, 1], [0, 0, 0]]
};

const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
};

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;
let score = 0;

// Main game loop
function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                const name = playfield[row][col];
                context.fillStyle = colors[name];
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    if (tetromino) {
        if (++count > 35) {
            tetromino.row++;
            count = 0;
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino();
            }
        }

        context.fillStyle = colors[tetromino.name];
        for (let row = 0; row < tetromino.matrix.length; row++) {
            for (let col = 0; col < tetromino.matrix[row].length; col++) {
                if (tetromino.matrix[row][col]) {
                    context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
                }
            }
        }
    }
}

// Restart the game
document.getElementById('restart-game').addEventListener('click', () => {
    document.getElementById('game-over').style.display = 'none';
    gameOver = false;
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    playfield.forEach(row => row.fill(0));
    tetromino = getNextTetromino();
    rAF = requestAnimationFrame(loop);
});

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    if (e.key === 'ArrowLeft') {
        moveLeft();
    } else if (e.key === 'ArrowRight') {
        moveRight();
    } else if (e.key === 'ArrowDown') {
        moveDown();
    } else if (e.key === 'ArrowUp') {
        rotateTetromino();
    }
});

// Add touch event listeners for swiping
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 0) {
            moveRight();
        } else {
            moveLeft();
        }
    } else {
        if (deltaY > 0) {
            moveDown();
        } else {
            rotateTetromino(); // Swipe up to rotate
        }
    }
});

function moveLeft() {
    if (gameOver) return;
    tetromino.col--;
    if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.col++;
    }
}

function moveRight() {
    if (gameOver) return;
    tetromino.col++;
    if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.col--;
    }
}

function moveDown() {
    if (gameOver) return;
    tetromino.row++;
    if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
    }
}

function rotateTetromino() {
    if (gameOver) return;
    const rotatedMatrix = rotate(tetromino.matrix);
    if (isValidMove(rotatedMatrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = rotatedMatrix;
    }
}

// Start the game loop
rAF = requestAnimationFrame(loop);
