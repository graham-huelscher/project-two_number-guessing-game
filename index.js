'use strict';

function Game(max, numberOfGuesses) {
    this.max = max;
    this.numberOfGuesses = numberOfGuesses;
}

const gameBoard = []

const gameState = {
    firstTime: true,
    userName: '',
    numberOfGuesses: 0,
    targetNumber: -1,
    maxNumber: -1,
    bounds: []
}

$(oneTimeSetup);

function oneTimeSetup() {

    // Get the Username and Maximum
    $('.first-submit').click(() => {
        if (gameBoard.length >= 1) gameState.firstTime = false;
        if (gameState.firstTime) gameState.userName = $('#userName').val();
        let maxNumber = $('#maxNum').val();
        initialSetup(maxNumber);
    });

    //Hitting enter on userName field clicks first submit button
    $('#userName').keypress(event => {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('.first-submit').click();
        }
    });

    //Hitting enter on maxNumber field clicks first submit button
    $('#maxNum').keypress(event => {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('.first-submit').click();
        }
    });

    //get user's guesses
    $('.second-submit').click(() => {
        let guess = $('#guess').val();
        guessValidate(guess);
    });

    //Hitting enter on guess field clicks second submit button
    $('#guess').keypress(event => {
        if (event.keyCode === 13) {
            event.preventDefault();
            $('.second-submit').click();
        }
    });

    $('.yes-btn').click(() => {
        $('.play-again').hide();
        $('.demo').remove();
        $('.userName').remove();
        $('.first-form').show();
        gameRefresh();
    });

    $('.no-btn').click(() => {
        $('.demo').remove();
        $('.play-again').hide();
        $('.thanks-for-playing').show();
    });
}


function initialSetup(maxNumber) {

    let userName = gameState.userName;

    if (userName === '' && maxNumber === '') {
        error('.no-name', '.first-submit');
        error('.maxNumber', '');
    }
    else if (userName === '') {
        if (!checkPosInt(maxNumber, '.maxNumber')) $('#maxNum').val('');
        error('.no-name', '.first-submit');
    }
    else if (maxNumber === '') {
        error('.maxNumber', '.first-submit');
    }
    else if (checkPosInt(maxNumber, '.maxNumber', '.first-submit')) {
        updateGameState(maxNumber);
        setupGameHTMLDiv(userName, maxNumber);
    }
    else {
        $('#maxNum').val('');
    }
}

function updateGameState(maxNumber) {
    gameState.maxNumber = Number(maxNumber);
    gameState.targetNumber = generateRandomNumber(maxNumber);
    gameState.bounds.push(1);
    gameState.bounds.push(maxNumber);
}

function setupGameHTMLDiv(userName, maxNumber) {
    $('#maxNum').val('');
    if (gameState.firstTime) $('.header').html('Welcome ' + userName + '! Let\'s play!');
    else $('.header').html('Welcome back ' + userName + '! Let\'s play!');
    $('.first-form').hide();
    $('.active-game').show();
    $('.second-num').html(maxNumber);
}

function guessValidate(guess) {
    let targetNumber = gameState.targetNumber;

    if (guess === '') {
        error('.numberGuess', '.second-submit');
    }
    else {
        $('#guess').val('');
        if (checkPosInt(guess, '.numberGuess', '.second-submit')){
            guess = Number(guess);
            if (!outOfBounds(guess, '.numberGuess', '.second-submit')) {
                gameState.numberOfGuesses++;
                if (isGuessCorrect(targetNumber, guess)) {
                    let game = new Game(gameState.maxNumber, gameState.numberOfGuesses);
                    gameBoard.push(game);
                    gameDone(targetNumber);
                }
            }
        }
    }
}

function gameDone(targetNumber) {
    $('.tempHeader').remove();

    $('.prevGames').append(`
    <tr>
        <th scope='row'>#${gameBoard.length}</th>
        <td>${gameBoard[gameBoard.length - 1].max}</td>
        <td>${gameBoard[gameBoard.length - 1].numberOfGuesses}</td>
    </tr>`);

    $('.active-game').hide();
    $('.fireworks-container').html(`<div class="demo"></div>`);
    $('.demo').fireworks({ sound: false, opacity: 0.9, width: '100%', height: '100%' });
    $('.rainbow').html(`Congratulations ${gameState.userName} you won!`);
    $('.replay').html(`The number was ${targetNumber}. Do you want to play again?`)
    $('.play-again').show();

}

function error(selector, button) {
    $(button).toggleClass('disabled');
    $(button).attr('disabled', 'disabled');
    setTimeout(() => {
        $(button).toggleClass('disabled');
        $(button).removeAttr('disabled');
    }, 4000);
    $(selector).slideDown(500).delay(3000).slideUp(500);
}

function generateRandomNumber(max) {
    // generate a random integer between 1 and max
    return Math.floor(Math.random() * Math.floor(max)) + 1;
}

function checkPosInt(num, selector, button) {
    let isPosInt = true;
    //a little hacky
    if (num == Number(num)) {
        num = Number(num);
    }

    if (!Number.isInteger(num) || num <= 0) {
        inputSpecificError(selector, button, num)
        isPosInt = false;
    }
    return isPosInt;
}

function outOfBounds(guess, selector, button) {
    let outsideBounds = true;
    console.log(gameState.bounds[1] + "  " + typeof (guess))
    if (guess > gameState.bounds[1]) {
        inputSpecificError(selector, button, 'high');
    }
    else if (guess < gameState.bounds[0]) {
        inputSpecificError(selector, button, 'low')
    }
    else outsideBounds = false;
    return outsideBounds
}

const ErrorStates = {
    OutOfBoundsHigh: 'high',
    OutOfBoundsLow: 'low',
    GuessTooHigh: 'HIGH',
    GuessTooLow: 'LOW'



}


function inputSpecificError(selector, button, errorType) {
    if (errorType === ErrorStates.OutOfBoundsHigh || errorType === ErrorStates.OutOfBoundsLow) {
        $(selector).html(`Your guess was out of bounds on the ${errorType} end. Please try again.`)

    }
    else if (errorType === ErrorStates.GuessTooHigh || errorType === ErrorStates.GuessTooLow) {
        $(selector).html(`Your guess was too ${errorType}. The range bar is updating to reflect this.`)
    }
    else {
        $(selector).html(`${errorType} is not a positive integer, please try again`)
    }

    error(selector, button);
    setTimeout(() => {
        $(selector).html('This is a required value');
    }, 4000);
}

function isGuessCorrect(goal, guess) {
    let maxNumber = gameState.maxNumber;
    let gameOver = false;
    if (guess > goal) {
        updateRangeBar('.second-num', gameState.bounds[1], guess, 'second');
        gameState.bounds[1] = guess - 1;
        inputSpecificError('.numberGuess', '.second-submit', 'HIGH');
        $('.second-num').html(gameState.bounds[1]);
    }
    else if (guess < goal) {
        updateRangeBar('.first-num', gameState.bounds[0], guess, 'first');
        gameState.bounds[0] = guess + 1;
        inputSpecificError('.numberGuess', '.second-submit', 'LOW');
        $('.first-num').html(gameState.bounds[0]);
    }
    else {
        $('.first-num').html('1');
        $('#guess').val('');
        gameOver = true;
    }
    return gameOver;
}

function updateRangeBar(selector, bound, guess, whichNumber) {

    let total = gameState.maxNumber;
    let proportion = Math.floor(((Math.abs(bound - guess) + 1) / total) * 80);

    $('.guess-bar').animate({
        width: `-=${proportion}%`,
    }, 3000, function () {
    });
    $(selector).animate({
        width: `+=${proportion}%`,
    }, 3000, function () {
    });

}

function gameRefresh() {
    gameState.bounds = [];
    gameState.numberOfGuesses = 0;
    $('.first-num').css('width', '8%');
    $('.second-num').css('width', '8%');
    $('.guess-bar').css('width', '80%');
}
