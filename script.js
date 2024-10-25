const timeDisplay = document.getElementById('time');
const scoreDisplay = document.getElementById('score');
const coinsDisplay = document.getElementById('coins');
const startButton = document.getElementById('startButton');
const gameContainer = document.getElementById('gameContainer');
const scoreCard = document.getElementById('scoreCard');
const finalScoreDisplay = document.getElementById('finalScore');
const finalCoinsDisplay = document.getElementById('finalCoins');
const bgMusic = document.getElementById('bgMusic');
const coinSound = document.getElementById('coinSound');
const ballClickSound = document.getElementById('ballClickSound');
const timeUpSound = document.getElementById('timeUpSound');
const overlay = document.getElementById('overlay');
let playerName = ""; // Variável para o nome do jogador

let timeLeft = 10;
let score = 0;
let coins = 0;
let combo = 1;
let lastClickTime = 0;
let comboTimeout;
let interval;
let balls = [];
let gameActive = false;

// Função para pegar o parâmetro "username" da URL
function getPlayerNameFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('username') || "Jogador Desconhecido"; // Se não encontrar, usa "Jogador Desconhecido"
}

// Inicializa o nome do jogador ao carregar a página
window.onload = function() {
    playerName = getPlayerNameFromURL();
    console.log("Jogador:", playerName); // Exibe no console o nome do jogador
};

function randomPosition() {
    const containerWidth = gameContainer.clientWidth;
    const containerHeight = gameContainer.clientHeight;
    const x = Math.random() * (containerWidth - 50);
    const y = Math.random() * (containerHeight - 50);
    return { x, y };
}

function createBall() {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    gameContainer.appendChild(ball);

    const { x, y } = randomPosition();
    ball.style.left = `${x}px`;
    ball.style.top = `${y}px`;

    ball.addEventListener('click', () => {
        if (!gameActive) return;

        const now = Date.now();
        if (now - lastClickTime < 500) {
            combo++;
        } else {
            combo = 1;
        }
        lastClickTime = now;

        score += combo;
        scoreDisplay.textContent = score;

        if (Math.random() < 0.5) {
            coins++;
            coinsDisplay.textContent = coins;
            coinSound.currentTime = 0;
            coinSound.play();
        }

        ballClickSound.currentTime = 0;
        ballClickSound.play();

        ball.style.transition = "opacity 0.3s";
        ball.style.opacity = "0";

        setTimeout(() => {
            gameContainer.removeChild(ball);
            checkBalls();
        }, 300);

        clearTimeout(comboTimeout);
        comboTimeout = setTimeout(() => {
            combo = 1;
        }, 500);
    });

    balls.push(ball);
}

function checkBalls() {
    const currentBalls = gameContainer.childElementCount;
    if (currentBalls < 5) {
        for (let i = currentBalls; i < 5; i++) {
            createBall();
        }
    }
}

function startGame() {
    clearInterval(interval);
    gameActive = true;
    startButton.style.display = 'none';
    bgMusic.currentTime = 0;
    bgMusic.play();
    timeLeft = 10;
    score = 0;
    coins = 0;
    combo = 1;
    scoreDisplay.textContent = score;
    coinsDisplay.textContent = coins;
    timeDisplay.textContent = timeLeft;

    balls.forEach(ball => ball.remove());
    balls = [];

    checkBalls();

    interval = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(interval);
    bgMusic.pause();
    timeUpSound.play();
    finalScoreDisplay.textContent = score;
    finalCoinsDisplay.textContent = coins;
    scoreCard.style.display = 'block';
    overlay.style.display = 'block';
    gameActive = false;

    // Enviar dados para o webhook
    sendScoreToWebhook();
}

function sendScoreToWebhook() {
    const data = {
        content: `Nome do Jogador: ${playerName}\nPontuação: ${score}\nMoedas: ${coins}`
    };

    console.log("Enviando dados para o webhook:", data); // Verifique o que está sendo enviado

    const webhookUrl = "https://discord.com/api/webhooks/1299509627326693437/nLTXXt30NopD_OYWva4shc8yITVBBofvlSq9Lc_Df-psU9SzBaYBDPmYWafaQ01oDd2Y"; // Certifique-se de que esta URL está correta

    fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na rede: ${response.status} ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Dados enviados com sucesso:', data);
    })
    .catch((error) => {
        console.error('Erro ao enviar dados:', error);
    });
}

startButton.addEventListener('click', startGame);

document.getElementById('restartButton').addEventListener('click', function() {
    scoreCard.style.display = 'none';
    overlay.style.display = 'none';
    startGame();
});

document.getElementById('closeButton').addEventListener('click', () => {
    scoreCard.style.display = "none";
    overlay.style.display = "none";
    gameActive = false;
    startButton.style.display = 'block';
});