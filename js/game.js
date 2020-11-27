let selectBagel;
let canSelect = false;
let gameStarted = false; //TODO Return to FALSE

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

function startGame(selectedBun) {
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

        setTimeout(() => {
            document.getElementById('card-wrapper').classList.add('inactive');
            document.getElementById('game-wrapper').classList.remove('inactive');
            gameStarted = true;
        }, 500);
    }
}

//Game logic
let cells = new Array(9); //true обозначает наличие булочки игрока в этой ячейке, false - бота; null - ячейка пуста
cells.fill(null);

let buttons = document.querySelectorAll('#game-field button');
Array.from(buttons).forEach(function(button, i) {
    button.addEventListener('click', () => {
        fieldClick(button, i);
    });
});
enableCellSelection();

let playerTurn = true;

function fieldClick(button, index) {
    
}

function isCellFree(cell) {
    return cells[cell] === null;
}

function getBunFor(button, searchForPlayerBun) {
    for(let node of button.children) {
        console.log(node);
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
    Array.from(buttons).forEach(function(button, i) {
        if(isCellFree(i)) {
            getBunFor(button).classList.add('ghost-bun');
        }
    });
}

function disableCellSelection() {
    for(let button in buttons) {
        getBunFor(button).classList.remove('ghost-bun');
    }
}