let selectBagel;
let canSelect = false;
let gameStarted = false;

//Добавляем возможность выбирать карточки только после завершения начальной анимации
let cards = document.getElementsByClassName('card');
for(let card of cards) {
    card.addEventListener('animationend', animation => {
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

function startGame(clickedElement, isBagel) {
    if(!gameStarted && canSelect) {
        clickedElement.classList.add('selected');
        clickedElement.classList.remove('select-pretzel');
        clickedElement.classList.remove('select-bagel');
        cloneElement(clickedElement);
        selectBagel = isBagel;
        gameStarted = true;
    }
}