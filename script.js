const cardBoard = document.getElementById('card-board');
const clicksSpan = document.getElementById('clicks');
const pairsLeftSpan = document.getElementById('pairs-left');
const pairsMatchedSpan = document.getElementById('pairs-matched');
const totalPairsSpan = document.getElementById('total-pairs');
const timeLeftSpan = document.getElementById('time-left');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const powerUpBtn = document.getElementById('power-up-btn');
const difficultySelect = document.getElementById('difficulty');
const themeSelect = document.getElementById('theme');

let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let clicks = 0;
let pairsLeft = 0;
let timer;
let timeLeft = 0;
let preventClick = false;

function fetchPokemon() {
    return axios.get('https://pokeapi.co/api/v2/pokemon?limit=150')
        .then(response => response.data.results)
        .then(pokemons => {
            const selectedPokemons = pokemons.sort(() => 0.5 - Math.random()).slice(0, totalPairs);
            return Promise.all(selectedPokemons.map(pokemon => axios.get(pokemon.url)));
        })
        .then(responses => responses.map(response => response.data));
}

function createCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.dataset.id = pokemon.id;
    card.innerHTML = `
        <div class="pokemon-card-inner">
            <div class="pokemon-card-front">
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="img-fluid">
            </div>
            <div class="pokemon-card-back">?</div>
        </div>
    `;
    card.addEventListener('click', handleCardClick);
    return card;
}

function handleCardClick(event) {
    if (preventClick || flippedCards.length === 2) {
        return;
    }

    const card = event.currentTarget;
    if (card.classList.contains('flipped') || card.dataset.matched === 'true') {
        return;
    }
    card.classList.add('flipped');
    flippedCards.push(card);
    clicks++;
    clicksSpan.textContent = clicks;
    if (flippedCards.length === 2) {
        preventClick = true;
        checkMatch();
    }
}

function checkMatch() {
    const [firstCard, secondCard] = flippedCards;
    if (firstCard.dataset.id === secondCard.dataset.id) {
        firstCard.dataset.matched = 'true';
        secondCard.dataset.matched = 'true';
        firstCard.style.backgroundColor = 'gray';
        secondCard.style.backgroundColor = 'gray';
        matchedPairs++;
        pairsMatchedSpan.textContent = matchedPairs;
        pairsLeft--;
        pairsLeftSpan.textContent = pairsLeft;
        if (pairsLeft === 0) {
            clearInterval(timer);
            setTimeout(() => alert('You Win!'), 300);
        }
        flippedCards = [];
        preventClick = false;
    } else {
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            flippedCards = [];
            preventClick = false;
        }, 1000);
    }
}

function startGame() {
    const difficulty = difficultySelect.value;
    switch (difficulty) {
        case 'easy':
            totalPairs = 3;
            timeLeft = 60;
            cardBoard.style.gridTemplateColumns = 'repeat(3, 1fr)';
            cardBoard.style.gridTemplateRows = 'repeat(2, 1fr)';
            break;
        case 'medium':
            totalPairs = 6;
            timeLeft = 45;
            cardBoard.style.gridTemplateColumns = 'repeat(4, 1fr)';
            cardBoard.style.gridTemplateRows = 'repeat(3, 1fr)';
            break;
        case 'hard':
            totalPairs = 10;
            timeLeft = 30;
            cardBoard.style.gridTemplateColumns = 'repeat(5, 1fr)';
            cardBoard.style.gridTemplateRows = 'repeat(4, 1fr)';
            break;
    }
    pairsLeft = totalPairs;
    matchedPairs = 0;
    clicks = 0;
    flippedCards = [];
    cards = [];
    clicksSpan.textContent = clicks;
    pairsLeftSpan.textContent = pairsLeft;
    pairsMatchedSpan.textContent = matchedPairs;
    totalPairsSpan.textContent = totalPairs;
    timeLeftSpan.textContent = timeLeft;
    cardBoard.innerHTML = '';
    fetchPokemon().then(pokemons => {
        pokemons.forEach(pokemon => {
            const card1 = createCard(pokemon);
            const card2 = createCard(pokemon);
            cards.push(card1, card2);
        });
        cards.sort(() => 0.5 - Math.random());
        cards.forEach(card => cardBoard.appendChild(card));
        startTimer();
    });
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timeLeftSpan.textContent = timeLeft;
        if (timeLeft === 0) {
            clearInterval(timer);
            alert('Time\'s Up! You Lose!');
        }
    }, 1000);
}

function resetGame() {
    clearInterval(timer);
    startGame();
}

function powerUp() {
    cards.forEach(card => card.classList.add('flipped'));
    setTimeout(() => cards.forEach(card => {
        if (card.dataset.matched !== 'true') {
            card.classList.remove('flipped');
        }
    }), 2000);
}

function changeTheme() {
    document.body.className = themeSelect.value + '-theme';
}

startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);
powerUpBtn.addEventListener('click', powerUp);
themeSelect.addEventListener('change', changeTheme);
