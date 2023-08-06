let main = document.querySelector('.main');
const scoreElem = document.getElementById('score')
const levelElem = document.getElementById('level')
const nextTetroElem = document.getElementById('next-tetro')
const startBtn = document.getElementById('start')
const pauseBtn = document.getElementById('pause')
const gameOver = document.getElementById("game-over");


let playField = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];


let score = 0;
let gameTimerId;
let currentLevel = 1;
let isPaused = true;

let possibleLevels = {
    1: {
        scorePerLine:10,
        speed: 400,
        nextLevelScore: 50,
    },
    2: {
        scorePerLine:15,
        speed: 300,
        nextLevelScore: 200,
    },
    3: {
        scorePerLine:20,
        speed: 200,
        nextLevelScore: 800,
    },
    4: {
        scorePerLine: 30,
        speed: 100,
        nextLevelScore: 1600,
    },
    5: {
        scorePerLine:50,
        speed: 50,
        nextLevelScore: Infinity,
    }
}

let figures = {
    O: [
        [1, 1],
        [1, 1]
    ],
    I: [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    S: [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
    ],
    Z: [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
    ],
    L: [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
    ],
    J: [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
    ],
    T: [
        [1, 1, 1],
        [0, 1, 0],
        [0, 0, 0]
    ],
}

let activeTetro = getNewTetro();
let nextTetro = getNewTetro(); // присваиваем переменной следующий тетро объект


// Рисуем поле
function draw(){
    let mainInnerHTML = "";
    for (let y = 0; y < playField.length; y++) {
        for (let x = 0; x < playField[y].length; x++) {
            if(playField[y][x] === 1){
                mainInnerHTML += '<div class="cell movingCell"></div>';
            }else if (playField[y][x] === 2){
                mainInnerHTML += '<div class="cell fixedCell"></div>';
            }
            else {
                mainInnerHTML += '<div class="cell"></div>';
            }
        }
    }
    main.innerHTML = mainInnerHTML;
}

// рисуем следующий по очереди элемент
function drawNextTetro() {
    let nextTetroInnerHTML = "";
    for (let y = 0; y < nextTetro.shape.length; y++) {
        for (let x = 0; x < nextTetro.shape[y].length; x++) {
            if (nextTetro.shape[y][x]) {
                nextTetroInnerHTML  += '<div class="cell movingCell"></div>';
            } else {
                nextTetroInnerHTML += '<div class="cell"></div>';
            }
        }
        nextTetroInnerHTML += '</br>';
    }
    nextTetroElem.innerHTML = nextTetroInnerHTML
}

// Убираем лишние блоки при движении
function removePrevActiveTetro(){
    for (let y = 0; y < playField.length; y++) {
        for (let x = 0; x < playField[y].length; x++) {
            if(playField[y][x] === 1) {
                playField[y][x] = 0;
            }
        }
    }
}

function addActiveTetro(){
    removePrevActiveTetro();
    for (let y = 0; y < activeTetro.shape.length; y++) {
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
            if (activeTetro.shape[y][x] === 1) {
                playField[activeTetro.y + y][activeTetro.x + x] = activeTetro.shape[y][x]
            }
        } 
    }
}

// Поворот фигуры (на самом деле это вращение массва вокргу центра)
 function rotateTetro() {
    const prevTetroState = activeTetro.shape;

        activeTetro.shape = activeTetro.shape[0].map((val, index) => activeTetro.shape.map((row) => row[index]).reverse()
        );
    // фиксация поворота внутри поля
    if (hasCollisions()){
        activeTetro.shape = prevTetroState;
    }   
}
        

// проверка движения фигурок (не выходят ли они за границы)
function hasCollisions(){
    for (let y = 0; y < activeTetro.shape.length; y++) {
        for (let x = 0; x < activeTetro.shape[y].length; x++) {
            if (
                activeTetro.shape[y][x] && (playField[activeTetro.y + y] === undefined || playField[activeTetro.y + y][activeTetro.x + x] === undefined || playField[activeTetro.y + y][activeTetro.x + x] === 2)
                ){
                return true;
            }
        }
    }
    return false;
}

// Движение фигурки вниз
// function canTetroMoveDown(){
//     for (let y = 0; y < playField.length; y++) {
//         for (let x = 0; x < playField[y].length; x++) {
//             if (playField[y][x] === 1) {
//                 if(y === playField.length - 1 || playField[y+1][x] ===2){
//                     return false;
//                 }
//             }
//         }
//     }
//     return true;
// }

// function moveTetroDown(){
//     if(canTetroMoveDown()){
//         for (let y = playField.length - 1; y >= 0; y--) {
//             for (let x = 0; x < playField[y].length; x++) { 
//                 if(playField[y][x] === 1){
//                     playField[y + 1][x] = 1;
//                     playField[y][x] = 0;
//                 }
//             }
//         }
//     } else {
//         fixTetro();
//     }
// }

// Движение фигурки влево
// function canTetroMoveLeft(){
//     for (let y = 0; y < playField.length; y++) {
//         for (let x = 0; x < playField[y].length; x++) {
//             if (playField[y][x] === 1) {
//                 if( x === 0 || playField[y][x-1] === 2){
//                     return false;
//                 }
//             }
//         }
//     }

//     return true;
// }

// function moveTetroLeft(){
//     if(canTetroMoveLeft()){
//         for (let y = playField.length - 1; y >= 0; y--) {
//             for (let x = 0; x < playField[y].length; x++) { 
//                 if(playField[y][x] === 1){
//                     playField[y][x - 1] = 1;
//                     playField[y][x] = 0;
//                 }
//             }
//         }
//     } 
// }

// Движение фигурки вправо
// function canTetroMoveRight(){
//     for (let y = 0; y < playField.length; y++) {
//         for (let x = 0; x < playField[y].length; x++) {
//             if (playField[y][x] === 1) {
//                 if( x === 9 || playField[y][x + 1] === 2){
//                     return false;
//                 }
//             }
//         }
//     }

//     return true;
// }

// function moveTetroRight(){
//     if(canTetroMoveRight()){
//         for (let y = playField.length - 1; y >= 0; y--) {
//             for (let x = 9; x >= 0; x--) { 
//                 if(playField[y][x] === 1){
//                     playField[y][x + 1] = 1;
//                     playField[y][x] = 0;
//                 }
//             }
//         }
//     } 
// }

// Убирать заполненные строки
function removeFullLines (){
    let canRemoveLine = true, 
        filledlines = 0;
    for (let y = 0; y < playField.length; y++) {
        for (let x = 0; x < playField[y].length; x++) {
            if(playField[y][x] !== 2) {
                canRemoveLine = false;
                break;
            }
        }
        if (canRemoveLine) {
            // удаляем весь ряд y
            playField.splice(y, 1);
            // удаляем с 0 индекса, 0 элементов и добавляем массив
            playField.splice(0, 0, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
            filledlines +=1;
        }
        canRemoveLine = true;
    }
    switch (filledlines) {
        case 1:
            score += possibleLevels[currentLevel].scorePerLine;
        break;
        case 2:
            score +=possibleLevels[currentLevel].scorePerLine * 3;
        break;
        case 3:
            score +=possibleLevels[currentLevel].scorePerLine * 6;    
        break;
        case 4:
            score +=possibleLevels[currentLevel].scorePerLine * 12;
        break;
    }

    scoreElem.innerHTML = score;

    if(score >= possibleLevels[currentLevel].nextLevelScore){
        currentLevel++;
        levelElem.innerHTML = currentLevel;
    }
}

// появление новых фигурок из рандома
function getNewTetro(){
    const possibleFigures = 'IOLJTSZ';
    const rand = Math.floor(Math.random() * 7);
    const NewTetro = figures[possibleFigures[rand]]

    return {
        x: Math.floor((10 - NewTetro[0].length) / 2),
        y: 0,
        shape: NewTetro,
    }
}
// Фиксация фигурок
function fixTetro() {
    for (let y = 0; y < playField.length; y++) {
        for (let x = 0; x < playField[y].length; x++) {
            if (playField[y][x] === 1){
                playField[y][x] = 2;
            }
        }
    }
}


function moveTetroDown(){
        activeTetro.y += 1;
        // moveTetroDown()
        if(hasCollisions()){
            activeTetro.y -= 1;
            fixTetro();
            removeFullLines();
            activeTetro = nextTetro;
                if(hasCollisions()) {
                    reset();
                    // alert('game over')
                };
            nextTetro = getNewTetro();
        }
}

function reset() {
    isPaused = true;
    
    clearTimeout(gameTimerId);

    playField = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];
    draw();
    gameOver.style.display = "block";
}


// событие при нажатии
document.onkeydown = function(e){
    if (!isPaused){
        if(e.keyCode === 37 ){
            activeTetro.x -= 1;
            if(hasCollisions()){
                activeTetro.x += 1;
            }
            // moveTetroLeft()
        } else if (e.keyCode === 39 ) {
            activeTetro.x += 1;
            if(hasCollisions()){
                activeTetro.x -= 1;
            }
            // moveTetroRight()
        } else if (e.keyCode === 40){
            moveTetroDown()
            }
        else if (e.keyCode === 32){
            rotateTetro();
        }
    updateGameState()
    }
};

function updateGameState() {
    if (!isPaused) {
      addActiveTetro();
      draw();
      drawNextTetro();
    }
}

pauseBtn.addEventListener( "click", (e) => {
    if (e.target.innerHTML === "Pause") {
        e.target.innerHTML = "Continue"
        clearTimeout(gameTimerId)
    } else {
        e.target.innerHTML = "Pause";
        gameTimerId = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
    isPaused = !isPaused
});

startBtn.addEventListener("click", (e) => {
    e.target.innerHTML = "Start Again";
    isPaused = false;
    gameTimerId = setTimeout(startGame, possibleLevels[currentLevel].speed);
    gameOver.style.display = 'none';
})

scoreElem.innerHTML = score;
levelElem.innerHTML = currentLevel;

// addActiveTetro();
draw();

// drawNextTetro();

function startGame(){
    moveTetroDown();
    if (!isPaused) {
      updateGameState();
      gameTimerId = setTimeout(startGame, possibleLevels[currentLevel].speed);
    }
    // document.querySelector('.audioAlert').play()
}


