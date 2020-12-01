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
            }, Math.ceil(Math.random() * 750) + 250);
        }
    }
}

function botThink() {
    //В первую очередь ищем возможные выигрышные варианты
    for(let combination of winningCombinations) {
        if(getBotBunCountAt(combination) == 2 && hasEmptyCellsAt(combination)) {
            placeBun(getFirstEmptyCellAt(combination));
            return;
        }
    }
    //Предотвращаем выигрышные комбинации игрока
    for(let combination of winningCombinations) {
        if(getPlayerBunCountAt(combination) == 2 && hasEmptyCellsAt(combination)) {
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
    for(let combination of shuffledCombinations) {
        if(getBotBunCountAt(combination) == 1 && getPlayerBunCountAt(combination) == 0) {
            let emptyCells = combination.slice().filter(isCellFree);
            let chosenCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
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
        if(firstBun) win(combination); else lose(combination);
        return;
    }
    if(buns.every(bun => bun != null)) draw();
}

function win(combination) {
    gameFinished = true;
    disableCellSelection();
    for(let i of combination) {
        buttons[i].classList.add('win-cell');
    }
    document.getElementById('game-info-wrapper').classList.add('inactive');
    document.getElementById('win-wrapper').classList.remove('inactive');
    let topText = document.querySelector('#win-wrapper .prizes h3');
    let bottomText = document.querySelector('#win-wrapper .prizes p');
    let prize = randomChoose([['FREE', 'Доставка'], ['5%', 'Скидка'], ['10%', 'Скидка']]);
    topText.innerHTML = prize[0];
    bottomText.innerHTML = prize[1];
    document.querySelector('#win-wrapper input').value = randomChoose(['вкусно-кушать-222', 'so-tasty-333', 'я-победил-111']);
}

//Copying text
function fallbackCopyTextToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }

function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }

    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
}

function copyPromo() {
    copyTextToClipboard(document.querySelector('#win-wrapper input').value);
    document.getElementById('copied-info').classList.remove('inactive');
}

function randomChoose(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function lose(combination) {
    gameFinished = true;
    disableCellSelection();
    for(let i of combination) {
        buttons[i].classList.add('lose-cell');
    }
}

function draw() {
    gameFinished = true;
    disableCellSelection();
    alert('DRAW');
}

function cellClick(cell) {
    if(!gameFinished && playerTurn && isCellFree(cell)) {
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
