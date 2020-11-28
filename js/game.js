let selectBagel = false;
let canSelect = false;
let gameStarted = false;

let bagelCard = document.querySelector('.select-bagel');
let pretzelCard = document.querySelector('.select-pretzel');

let cards = document.getElementsByClassName('card');
for(let card of cards) {
    card.addEventListener('animationend', animation => {
        //Добавляем возможность выбирать карточки только после завершения начальной анимации
        if(animation.animationName === 'slide-from-left' || animation.animationName === 'slide-from-right') {
            canSelect = true;
            card.classList.add('ready-to-select');
        }
    });
}

function cloneElement(element) {
    let clone = element.cloneNode(true);
    element.parentNode.replaceChild(clone, element);
}

function cardClick(selectedBun) {
    if(canSelect) {
        isBagel = selectedBun.classList.contains('select-bagel');
        selectBagel = isBagel;

        //Проигрываем анимацию для выбранной и проигнорированной карточки
        for(let card of cards) {
            card.classList.add(card == selectedBun ? 'selected-bun' : 'ignored-bun');
            if(card != selectedBun) card.classList.remove('ready-to-select');
            card.classList.remove('select-pretzel');
            card.classList.remove('select-bagel');
            cloneElement(card);
        }

        let topText = document.querySelector('.select-card-text-in');    
        topText.classList.remove('select-card-text-in');
        topText.classList.add('select-card-text-out');
        cloneElement(topText);

        canSelect = false;

        setTimeout(startGame, 500);
    }
}

function startGame() {
    document.getElementById('card-wrapper').classList.add('inactive');
    document.getElementById('game-wrapper').classList.remove('inactive');
    gameStarted = true;
    enableCellSelection();
}

//Game logic
let buns = new Array(9); //true обозначает наличие булочки игрока в этой ячейке, false - бота; null - ячейка пуста
buns.fill(null);

let buttons = Array.from(document.querySelectorAll('#game-field button'));
buttons.forEach(function(button, i) {
    button.addEventListener('click', () => {
        cellClick(i);
    });
});

let playerTurn = true;
let gameFinished = false;
const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], //Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], //Vertical
    [0, 4, 8], [2, 4, 6]]; //Diagonal

function placeBun(cell) {
    let bun = getBunAt(cell, playerTurn);
    bun.classList.add('placed');
    bun.classList.remove('ghost-bun');
    buns[cell] = playerTurn;
    calculateWin();
    if(!gameFinished) {
        playerTurn = !playerTurn;
        if(playerTurn) {
            enableCellSelection();
        } else {
            disableCellSelection();
            setTimeout(() => {
                botThink();
            }, Math.ceil(Math.random() * 700) + 200);
        }
    }
}

function botThink() {
    //В первую очередь ищем возможные выигрышные варианты
    for(let combination of winningCombinations) {
        if(getBotBunCountAt(combination) == 2 && hasEmptyCellsAt(combination)) {
            console.log('Winning');
            placeBun(getFirstEmptyCellAt(combination));
            return;
        }
    }
    //Предотвращаем выигрышные комбинации игрока
    for(let combination of winningCombinations) {
        console.log(`Combination: ${combination}, player buns: ${getPlayerBunCountAt(combination)}, empty cells: ${hasEmptyCellsAt(combination)}`);
        if(getPlayerBunCountAt(combination) == 2 && hasEmptyCellsAt(combination)) {
            console.log('Preventing');
            placeBun(getFirstEmptyCellAt(combination));
            return;
        }
    }
    //Пытаемся выбить выигрышную комбинацию
    let shuffledCombinations = winningCombinations.slice();
    for (let i = shuffledCombinations.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = shuffledCombinations[i];
        shuffledCombinations[i] = shuffledCombinations[j];
        shuffledCombinations[j] = temp;
    }
    console.log(shuffledCombinations);
    for(let combination of shuffledCombinations) {
        if(getBotBunCountAt(combination) == 1 && getPlayerBunCountAt(combination) == 0) {
            let emptyCells = combination.slice().filter(isCellFree);
            let chosenCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            console.log('Trying to win');
            placeBun(chosenCell);
            return;
        }
    }
    //Если ничего выше не выполнилось - ставим булочку в любую свободную ячейку
    let emptyCells = new Array(9);
    buns.forEach((cell, i) => {
        if(cell == null) {
            emptyCells[i] = i;
        }
    });
    let cleanEmptyCells = emptyCells.filter(cell => cell != null && cell != undefined);
    console.log('Random');
    placeBun(cleanEmptyCells[Math.floor(Math.random() * cleanEmptyCells.length)]);
}

function getBunsAt(combination) {
    let bunsHere = new Array(3);
    combination.forEach((cell, i) => {
        bunsHere[i] = buns[cell];
    });
    return bunsHere;
}

function hasEmptyCellsAt(combination) {
    return combination.slice().filter(isCellFree).length > 0;
}

function getFirstEmptyCellAt(combination) {
    let empty = combination.slice().filter(isCellFree);
    if(empty.length == 0) throw 'There is no empty cells in combination';
    return empty[0];
}

function getPlayerBunCountAt(combination) {
    let buns = getBunsAt(combination);
    return buns.filter(bun => bun == true).length;
}

function getBotBunCountAt(combination) {
    let buns = getBunsAt(combination);
    return buns.filter(bun => bun == false).length;
}

function calculateWin() {
    A: for(let combination of winningCombinations) {
        let firstBun = buns[combination[0]];
        for(let cell of combination) {
            if(isCellFree(cell) || buns[cell] != firstBun) continue A; 
        }
        if(firstBun) win(); else lose();
        return;
    }
    if(buns.every(bun => bun != null)) draw();
}

function win() {
    gameFinished = true;
    alert('WIN');
}

function lose() {
    gameFinished = true;
    alert('LOSE');
}

function draw() {
    gameFinished = true;
    alert('DRAW');
}

function cellClick(cell) {
    if(playerTurn && isCellFree(cell)) {
        placeBun(cell);
    }
}

function isCellFilledWithPlayerBun(cell) {
    return buns[cell] == true;
}

function isCellFilledWithBotBun(cell) {
    return buns[cell] == false;
}

function isCellFilled(cell) {
    return !isCellFree(cell);
}

function isCellFree(cell) {
    return buns[cell] == null;
}

function getBunFor(button, searchForPlayerBun) {
    for(let node of button.children) {
        if(node.classList.contains(!(selectBagel ^ searchForPlayerBun) ? 'game-bagel' : 'game-pretzel')) {
            return node;
        }
    }
    throw "Inner bun image not found";
}

function getBunAt(cell, searchForPlayerBun) {
    return getBunFor(buttons[cell], searchForPlayerBun);
}

function enableCellSelection() {
    buttons.forEach((button, i) => {
        if(isCellFree(i)) {
            getBunFor(button, true).classList.add('ghost-bun');
        }
    });
}

function disableCellSelection() {
    buttons.forEach((button) => {
        getBunFor(button, true).classList.remove('ghost-bun');
    });
}

startGame();