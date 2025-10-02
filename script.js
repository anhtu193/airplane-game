// Get DOM elements
const startButton = document.getElementById('startButton');
const startOverlay = document.getElementById('startOverlay');
const loadingVideo = document.getElementById('loadingVideo');
const gameVideo = document.getElementById('gameVideo');

// Mobile detection
const isMobile = () => {
    return window.innerWidth <= 768;
};

const isSmallMobile = () => {
    return window.innerWidth <= 480;
};

// Debug function to check mobile elements
const debugMobileElements = () => {
    console.log('Viewport width:', window.innerWidth, 'Mobile:', isMobile());
    console.log('Document ready state:', document.readyState);
    
    if (isMobile()) {
        console.log('Mobile detected, debugging elements...');
        console.log('Body height:', document.body.offsetHeight);
        console.log('Body style:', document.body.style.position);
        
        const gameContainer = document.querySelector('.game-container');
        console.log('Game container height:', gameContainer?.offsetHeight);
        console.log('Game container style:', gameContainer?.style.cssText);
        
        const gameScreen = document.querySelector('.game-screen');
        console.log('Game screen height:', gameScreen?.offsetHeight);
        console.log('Game screen visible:', gameScreen?.offsetHeight > 0);
        
        const loadingVideo = document.getElementById('loadingVideo');
        console.log('Loading video exists:', !!loadingVideo);
        console.log('Loading video active class:', loadingVideo?.classList.contains('active'));
        console.log('Loading video opacity:', loadingVideo ? getComputedStyle(loadingVideo).opacity : 'N/A');
        
        const startOverlay = document.getElementById('startOverlay');
        console.log('Start overlay exists:', !!startOverlay);
        console.log('Start overlay hidden class:', startOverlay?.classList.contains('hidden'));
        
        console.log('Game area exists:', !!document.querySelector('.game-area'));
    }
};

// Survey data
const surveyQuestions = [
    {
        id: 1,
        question: "Đây có phải là lần đầu bạn di chuyển bằng máy bay không?",
        answers: ["Đúng", "Không"]
    },
    {
        id: 2,
        question: "Bạn sẽ chọn dịch vụ bay của chúng tôi vì điều gì?",
        answers: ["Dịch vụ tốt, giá cả phù hợp", "Tôi muốn trải nghiệm dịch vụ của hãng", "Khác"]
    },
    {
        id: 3,
        question: "Xin cảm ơn bạn đã tham gia khảo sát. Giờ thì chúng ta cùng bắt đầu chơi nhé!",
        answers: ["Bắt đầu chơi"]
    }
];

let currentQuestionIndex = 0;
let surveyAnswers = [];

// Ensure loading video plays on page load
window.addEventListener('DOMContentLoaded', () => {
    // Prevent scroll and zoom on mobile
    if (isMobile()) {
        document.body.style.overflow = 'hidden';
        
        // Prevent double-tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // Prevent overscroll behavior
        document.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
    }
    
    loadingVideo.play().catch(err => {
        console.log('Autoplay prevented:', err);
        // If autoplay is blocked, we can try to play on first user interaction
    });
    
    // Debug mobile elements
    debugMobileElements();
    
    // Additional debug after a delay
    setTimeout(() => {
        if (isMobile()) {
            console.log('Delayed mobile debug...');
            debugMobileElements();
        }
    }, 1000);
});

// Handle start button click
startButton.addEventListener('click', () => {
    // Hide the start button overlay
    startOverlay.classList.add('hidden');
    
    // Fade out loading video
    loadingVideo.classList.remove('active');
    
    // Fade in and play game video
    gameVideo.classList.add('active');
    gameVideo.currentTime = 0;
    gameVideo.play();
});

// When game video ends, start survey flow
gameVideo.addEventListener('ended', () => {
    // Hide game video with slide effect
    gameVideo.style.transform = 'translateX(-100%)';
    gameVideo.style.transition = 'transform 0.3s ease-in-out';
    
    // Also hide the game screen container
    const gameScreen = document.querySelector('.game-screen');
    gameScreen.style.opacity = '0';
    gameScreen.style.transition = 'opacity 0.3s ease-in-out';
    
    setTimeout(() => {
        gameVideo.classList.remove('active');
        gameVideo.style.transform = '';
        gameVideo.style.transition = '';
        gameScreen.style.display = 'none';
        
        // Show survey notification
        showSurveyNotification();
    }, 300);
});

// Show survey notification
function showSurveyNotification() {
    const notification = document.createElement('div');
    notification.className = 'survey-notification';
    notification.style.opacity = '0';
    notification.innerHTML = `
        <div class="notification-content">
            <p>Trước khi bắt đầu chơi, xin phép bạn trả lời 1 số câu hỏi sau đây nhé</p>
            <button class="notification-btn" onclick="startSurvey()">Bắt đầu khảo sát</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Fade in first
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s ease-in-out';
        notification.style.opacity = '1';
    }, 50);
    
    // Slide in from right
    setTimeout(() => {
        notification.classList.add('slide-in');
    }, 100);
}

// Start survey
function startSurvey() {
    // Hide notification
    const notification = document.querySelector('.survey-notification');
    if (notification) {
        notification.remove();
    }
    
    // Add persistent black background with fade-in
    const blackBackground = document.createElement('div');
    blackBackground.className = 'survey-black-background';
    blackBackground.style.opacity = '0';
    blackBackground.style.transition = 'opacity 0.3s ease-in-out';
    document.body.appendChild(blackBackground);
    
    // Fade in black background
    setTimeout(() => {
        blackBackground.style.opacity = '1';
    }, 50);
    
    // Show first question
    showQuestion(0);
}

// Show question
function showQuestion(index) {
    const question = surveyQuestions[index];
    const questionContainer = document.createElement('div');
    questionContainer.className = 'question-container';
    questionContainer.innerHTML = `
        <div class="question-content">
            <h2>Câu hỏi ${question.id}</h2>
            <p class="question-text">${question.question}</p>
            <div class="answers-container">
                ${question.answers.map((answer, i) => `
                    <button class="answer-btn" onclick="selectAnswer(${index}, ${i}, '${answer}')">
                        ${answer}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(questionContainer);
    
    // Slide in from right
    setTimeout(() => {
        questionContainer.classList.add('slide-in');
    }, 100);
}

// Select answer
function selectAnswer(questionIndex, answerIndex, answer) {
    surveyAnswers[questionIndex] = answer;
    
    // Hide current question with slide out
    const questionContainer = document.querySelector('.question-container');
    questionContainer.classList.add('slide-out');
    
    setTimeout(() => {
        questionContainer.remove();
        
        // Show next question or finish survey
        if (questionIndex < surveyQuestions.length - 1) {
            showQuestion(questionIndex + 1);
        } else {
            showGameIntroduction();
        }
    }, 300);
}

// Show game introduction
function showGameIntroduction() {
    // Show game screen again with smooth transition
    const gameScreen = document.querySelector('.game-screen');
    gameScreen.style.display = 'flex';
    gameScreen.style.opacity = '0';
    gameScreen.style.transition = 'opacity 0.5s ease-in-out';
    
    // Fade out persistent black background
    const blackBackground = document.querySelector('.survey-black-background');
    if (blackBackground) {
        blackBackground.style.transition = 'opacity 0.3s ease-in-out';
        blackBackground.style.opacity = '0';
        
        // Remove after fade out completes
        setTimeout(() => {
            if (blackBackground.parentNode) {
                blackBackground.remove();
            }
        }, 500);
    }
    
    // Fade in game screen
    setTimeout(() => {
        gameScreen.style.opacity = '1';
    }, 50);
    
    // Hide loading video and show game introduction overlay after screen fades in
    setTimeout(() => {
        loadingVideo.classList.remove('active');
    }, 300);
    
    // Create game introduction overlay after screen transition
    setTimeout(() => {
        const introOverlay = document.createElement('div');
        introOverlay.className = 'game-intro-overlay';
        introOverlay.innerHTML = `
            <div class="intro-content">
                <h2>🎮 Hướng dẫn trò chơi</h2>
                <div style="text-align: left; margin: 15px 0;">
                    <p style="margin-bottom: 12px; font-size: 14px;">📋 <strong>Nhiệm vụ:</strong></p>
                    <p style="margin-bottom: 8px; padding-left: 15px; font-size: 13px;">• Bắt <span style="color: #ffd700; font-weight: bold;">6/10 máy bay</span> để thắng</p>
                    <p style="margin-bottom: 12px; padding-left: 15px; font-size: 13px;">• Có <span style="color: #ff6b6b; font-weight: bold;">3 mạng</span> để thực hiện</p>
                    
                    <p style="margin-bottom: 12px; font-size: 14px;">🎯 <strong>Cách chơi:</strong></p>
                    <p style="margin-bottom: 8px; padding-left: 15px; font-size: 13px;">• Chạm vào máy bay để bắt</p>
                    <p style="margin-bottom: 12px; padding-left: 15px; font-size: 13px;">• Chạm trượt mất 1 mạng</p>
                    
                    <p style="margin-bottom: 12px; font-size: 14px;">🏆 <strong>Phần thưởng:</strong></p>
                    <p style="margin-bottom: 8px; padding-left: 15px; font-size: 13px;">• Nhận một phần quà bí mật từ Vietjet!</p>
                </div>
                <button class="start-game-btn" onclick="startGame()">🚀  Bắt đầu chơi</button>
            </div>
        `;
        
        gameScreen.appendChild(introOverlay);
        
        // Fade in overlay
        setTimeout(() => {
            introOverlay.classList.add('active');
        }, 100);
    }, 400);
}

// Game state
let gameState = {
    score: 0,
    lives: 3,
    targetScore: 6,
    totalPlanes: 10,
    planesSpawned: 0,
    gameActive: false,
    planes: [],
    collectedPlanes: []
};

// Start game
function startGame() {
    // Hide intro overlay
    const introOverlay = document.querySelector('.game-intro-overlay');
    if (introOverlay) {
        introOverlay.classList.remove('active');
        setTimeout(() => {
            introOverlay.remove();
        }, 300);
    }
    
    // Initialize game
    initializeGame();
}

// Initialize the gameplay
function initializeGame() {
    const gameScreen = document.querySelector('.game-screen');
    
    // Hide loading video and start button
    loadingVideo.classList.remove('active');
    startOverlay.classList.add('hidden');
    
    // Create game UI
    createGameUI();
    
    // Start spawning planes
    gameState.gameActive = true;
    spawnPlanes();
    
    console.log('Game started with survey answers:', surveyAnswers);
}

// Create game UI elements
function createGameUI() {
    const gameScreen = document.querySelector('.game-screen');
    
    // Clear existing content
    gameScreen.innerHTML = '';
    
    // Create game background
    const gameBackground = document.createElement('div');
    gameBackground.className = 'game-background';
    gameBackground.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: url('assets/images/gameplay_background.jpg') no-repeat center center;
        background-size: cover;
        z-index: 1;
    `;
    
    // Create lives display
    const livesDisplay = document.createElement('div');
    livesDisplay.className = 'lives-display';
    livesDisplay.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        display: flex;
        gap: 10px;
        z-index: 10;
    `;
    
    // Create hearts for lives with responsive sizing
    const screenWidth = window.innerWidth;
    let heartSize = 35;
    
    if (screenWidth <= 320) {
        heartSize = 25;
    } else if (screenWidth <= 480) {
        heartSize = 28;
    } else if (screenWidth <= 768) {
        heartSize = 35;
    } else {
        heartSize = 53;
    }
    
    for (let i = 0; i < gameState.lives; i++) {
        const heart = document.createElement('img');
        heart.src = 'assets/images/heart.png';
        heart.className = 'heart';
        heart.style.cssText = `
            width: ${heartSize}px;
            height: ${heartSize}px;
            image-rendering: pixelated;
        `;
        livesDisplay.appendChild(heart);
    }
    
    // Create score display
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    scoreDisplay.innerHTML = `${gameState.score}/${gameState.targetScore}`;
    scoreDisplay.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        color: #ffffff;
        font-family: 'Press Start 2P', cursive;
        font-size: 16px;
        text-shadow: 2px 2px 0px #000000;
        z-index: 10;
    `;
    
    // Create collected planes area
    const collectedArea = document.createElement('div');
    collectedArea.className = 'collected-planes';
    collectedArea.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 20px;
        display: flex;
        gap: 10px;
        z-index: 10;
    `;
    
    // Create game area for planes
    const gameArea = document.createElement('div');
    gameArea.className = 'game-area';
    gameArea.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 5;
    `;
    
    // Add click handler to game area for missed taps
    gameArea.addEventListener('click', (e) => {
        // Only lose life if clicking on game area (not on a plane)
        if (e.target === gameArea) {
            showMissFeedback(e.clientX, e.clientY);
            loseLife();
        }
    });
    
    // Assemble the game screen
    gameScreen.appendChild(gameBackground);
    gameScreen.appendChild(gameArea);
    gameScreen.appendChild(livesDisplay);
    gameScreen.appendChild(scoreDisplay);
    gameScreen.appendChild(collectedArea);
}

// Spawn planes randomly
function spawnPlanes() {
    if (!gameState.gameActive || gameState.planesSpawned >= gameState.totalPlanes) return;
    
    // Create a new plane
    const plane = createPlane();
    gameState.planes.push(plane);
    gameState.planesSpawned++;
    
    // Schedule next plane spawn if we haven't reached the limit
    if (gameState.planesSpawned < gameState.totalPlanes) {
        const spawnDelay = Math.random() * 1500 + 500; // 0.5-2 seconds (faster spawning)
        setTimeout(() => {
            if (gameState.gameActive) {
                spawnPlanes();
            }
        }, spawnDelay);
    }
}

// Create a single plane
function createPlane() {
    const gameArea = document.querySelector('.game-area');
    const plane = document.createElement('img');
    
    // Random direction (left to right or right to left)
    const direction = Math.random() > 0.5 ? 'left-to-right' : 'right-to-left';
    const isFlipped = direction === 'left-to-right';
    
    plane.src = 'assets/images/plane.png';
    plane.className = 'flying-plane';
    
    // Responsive sizing based on screen width
    const screenWidth = window.innerWidth;
    let planeSize = 60; // Default size
    
    if (screenWidth <= 320) {
        planeSize = 40;
    } else if (screenWidth <= 480) {
        planeSize = 50;
    } else if (screenWidth <= 768) {
        planeSize = 60;
    } else {
        planeSize = 75;
    }
    
    plane.style.cssText = `
        position: absolute;
        width: ${planeSize}px;
        height: ${Math.round(planeSize * 0.7)}px;
        image-rendering: pixelated;
        cursor: pointer;
        z-index: 6;
        transition: opacity 0.3s ease;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        pointer-events: auto;
        touch-action: manipulation;
        ${isFlipped ? 'transform: scaleX(-1);' : ''}
    `;
    
    // Random vertical position
    const topPosition = Math.random() * 60 + 20; // 20% to 80% of screen height
    plane.style.top = topPosition + '%';
    
    // Set starting position based on direction
    if (direction === 'left-to-right') {
        plane.style.left = '-75px';
        plane.style.right = 'auto';
    } else {
        plane.style.right = '-75px';
        plane.style.left = 'auto';
    }
    
    // Prevent drag and selection
    plane.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
    
    plane.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });
    
    plane.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });
    
    // Add click handler
    plane.addEventListener('click', () => catchPlane(plane));
    
    // Add touchend handler for mobile
    plane.addEventListener('touchend', (e) => {
        e.preventDefault();
        catchPlane(plane);
    });
    
    // Add to game area
    gameArea.appendChild(plane);
    
    // Animate plane movement
    const animationDuration = Math.random() * 2000 + 3000; // 3-5 seconds (faster movement)
    plane.style.transition = `all ${animationDuration}ms linear`;
    
    setTimeout(() => {
        if (direction === 'left-to-right') {
            plane.style.left = '100%';
        } else {
            plane.style.right = '100%';
        }
    }, 50);
    
    // Store plane state for cleanup
    let planeEscaped = false;
    
    // Remove plane when it reaches the end
    setTimeout(() => {
        if (plane.parentNode) {
            plane.parentNode.removeChild(plane);
            const index = gameState.planes.indexOf(plane);
            if (index > -1) {
                gameState.planes.splice(index, 1);
            }
            
            // No life loss when plane escapes - only when player misses a tap
            
            // Check if all planes have been spawned and cleared
            if (gameState.planesSpawned >= gameState.totalPlanes && gameState.planes.length === 0) {
                // Game over if not enough planes caught
                if (gameState.score < gameState.targetScore) {
                    gameLose();
                }
            }
        }
    }, animationDuration + 100);
    
    return plane;
}

// Catch a plane
function catchPlane(plane) {
    if (!gameState.gameActive) return;
    
    // Mark plane as caught to prevent life loss
    plane.classList.add('caught');
    plane.classList.remove('flying-plane');
    plane.style.pointerEvents = 'none';
    plane.style.transition = 'opacity 0.5s ease';
    plane.style.opacity = '0';
    
    // Add to collected planes
    gameState.score++;
    gameState.collectedPlanes.push(plane);
    
    // Update score display
    const scoreDisplay = document.querySelector('.score-display');
    scoreDisplay.innerHTML = `${gameState.score}/${gameState.targetScore}`;
    
    // Add collected plane to bottom left
    const collectedArea = document.querySelector('.collected-planes');
    const collectedPlane = document.createElement('img');
    collectedPlane.src = 'assets/images/plane-2.png';
    
    // Responsive sizing for collected planes
    const screenWidth = window.innerWidth;
    let collectedSize = 45;
    
    if (screenWidth <= 320) {
        collectedSize = 30;
    } else if (screenWidth <= 480) {
        collectedSize = 35;
    } else if (screenWidth <= 768) {
        collectedSize = 40;
    } else {
        collectedSize = 45;
    }
    
    collectedPlane.style.cssText = `
        width: ${collectedSize + 15}px;
        height: ${collectedSize}px;
        image-rendering: pixelated;
        opacity: 0;
        transition: opacity 0.5s ease;
    `;
    collectedArea.appendChild(collectedPlane);
    
    // Fade in collected plane
    setTimeout(() => {
        collectedPlane.style.opacity = '1';
    }, 100);
    
    // Remove original plane
    setTimeout(() => {
        if (plane.parentNode) {
            plane.parentNode.removeChild(plane);
            const index = gameState.planes.indexOf(plane);
            if (index > -1) {
                gameState.planes.splice(index, 1);
            }
        }
    }, 500);
    
    // Check win condition
    if (gameState.score >= gameState.targetScore) {
        gameWin();
    }
}

// Lose a life
function loseLife() {
    if (!gameState.gameActive) return;
    
    gameState.lives--;
    const hearts = document.querySelectorAll('.heart');
    if (hearts[gameState.lives]) {
        hearts[gameState.lives].style.opacity = '0.3';
    }
    
    // Check lose condition
    if (gameState.lives <= 0) {
        gameLose();
    }
}

// Game win
function gameWin() {
    gameState.gameActive = false;
    console.log('You won!');
    showWinScreen();
}

// Game lose
function gameLose() {
    gameState.gameActive = false;
    console.log('You lost!');
    showLoseScreen();
}

// Show win screen
function showWinScreen() {
    const gameScreen = document.querySelector('.game-screen');
    const winScreen = document.createElement('div');
    winScreen.className = 'game-end-screen';
    winScreen.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    `;
    
    const winContent = document.createElement('div');
    winContent.style.cssText = `
        text-align: center;
        color: #ffffff;
        max-width: 400px;
        padding: 20px;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    winContent.innerHTML = `
        <h2 style="font-family: 'Fernando', sans-serif; font-size: 20px; margin-bottom: 15px; color: #ffd700; line-height: 1.3;">
            Chúc mừng! Bạn đã bắt được các máy bay Vietjet
        </h2>
        <p style="font-family: 'Fernando', sans-serif; font-size: 16px; margin-bottom: 20px; line-height: 1.4;">
            Tuyệt vời! Đây là phần quà dành cho bạn. Hãy nhận voucher ngay nhé.
        </p>
        <div style="margin: 20px 0;">
            <img src="assets/images/vietjet-voucher.png" alt="Vietjet Voucher QR Code" style="
                width: 200px;
                height: 200px;
                image-rendering: pixelated;
                scale: 1.1;
                margin-top: 20px;
                border: 2px solid #ffffff;
                border-radius: 8px;
            ">
        </div>
        <p style="font-family: 'Fernando', sans-serif; font-size: 14px; margin: 15px 0;">
            Quét mã QR để nhận voucher
        </p>
        <button onclick="showRatingScreen()" style="
            font-family: 'Fernando', sans-serif;
            font-size: 16px;
            padding: 12px 25px;
            background: linear-gradient(180deg, #00bfff 0%, #0099dd 50%, #0077bb 100%);
            color: #ffffff;
            border: 3px solid #2a1a4a;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 15px;
        ">Kết thúc</button>
    `;
    
    winScreen.appendChild(winContent);
    gameScreen.appendChild(winScreen);
}

// Show lose screen
function showLoseScreen() {
    const gameScreen = document.querySelector('.game-screen');
    const loseScreen = document.createElement('div');
    loseScreen.className = 'game-end-screen';
    loseScreen.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    `;
    
    const loseContent = document.createElement('div');
    loseContent.style.cssText = `
        text-align: center;
        color: #ffffff;
        max-width: 500px;
        padding: 20px;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    loseContent.innerHTML = `
        <h2 style="font-family: 'Fernando', sans-serif; font-size: 20px; margin-bottom: 15px; color: #ffd700; line-height: 1.3;">
            Bạn suýt bắt được máy bay rồi. Hãy thử lại vào lần sau nhé!
        </h2>
        <p style="font-family: 'Fernando', sans-serif; font-size: 16px; margin-bottom: 25px; line-height: 1.4;">
            Không sao, Vietjet vẫn luôn đồng hành cùng bạn trong mọi hành trình!
        </p>
        <button onclick="showRatingScreen()" style="
            font-family: 'Fernando', sans-serif;
            font-size: 16px;
            padding: 12px 25px;
            background: linear-gradient(180deg, #00bfff 0%, #0099dd 50%, #0077bb 100%);
            color: #ffffff;
            border: 3px solid #2a1a4a;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 15px;
        ">Kết thúc</button>
    `;
    
    loseScreen.appendChild(loseContent);
    gameScreen.appendChild(loseScreen);
}

// Show rating screen
function showRatingScreen() {
    const gameScreen = document.querySelector('.game-screen');
    
    // Remove previous screen
    const endScreen = document.querySelector('.game-end-screen');
    if (endScreen) {
        endScreen.remove();
    }
    
    const ratingScreen = document.createElement('div');
    ratingScreen.className = 'rating-screen';
    ratingScreen.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    `;
    
    const ratingContent = document.createElement('div');
    ratingContent.style.cssText = `
        text-align: center;
        color: #ffffff;
        max-width: 400px;
        padding: 20px;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    ratingContent.innerHTML = `
        <h2 style="font-family: 'Fernando', sans-serif; font-size: 20px; margin-bottom: 20px; line-height: 1.6;">
            Bạn có hài lòng với dịch vụ hôm nay không?
        </h2>
        <div class="star-rating" style="margin: 20px 0;">
            <span class="star" data-rating="1" style="
                font-size: 35px;
                color: #666;
                cursor: pointer;
                margin: 0 8px;
                transition: color 0.2s ease;
            ">★</span>
            <span class="star" data-rating="2" style="
                font-size: 35px;
                color: #666;
                cursor: pointer;
                margin: 0 8px;
                transition: color 0.2s ease;
            ">★</span>
            <span class="star" data-rating="3" style="
                font-size: 35px;
                color: #666;
                cursor: pointer;
                margin: 0 8px;
                transition: color 0.2s ease;
            ">★</span>
            <span class="star" data-rating="4" style="
                font-size: 35px;
                color: #666;
                cursor: pointer;
                margin: 0 8px;
                transition: color 0.2s ease;
            ">★</span>
            <span class="star" data-rating="5" style="
                font-size: 35px;
                color: #666;
                cursor: pointer;
                margin: 0 8px;
                transition: color 0.2s ease;
            ">★</span>
        </div>
        <p id="rating-text" style="font-family: 'Fernando', sans-serif; font-size: 14px; margin: 15px 0; opacity: 0; line-height: 1.3;">
            Chọn số sao để đánh giá
        </p>
        <button id="submit-rating" onclick="submitRating()" style="
            font-family: 'Fernando', sans-serif;
            font-size: 16px;
            padding: 12px 25px;
            background: linear-gradient(180deg, #00bfff 0%, #0099dd 50%, #0077bb 100%);
            color: #ffffff;
            border: 3px solid #2a1a4a;
            border-radius: 8px;
            cursor: pointer;
            margin-top: 15px;
            opacity: 0;
            transition: opacity 0.3s ease;
        ">Gửi đánh giá</button>
    `;
    
    ratingScreen.appendChild(ratingContent);
    gameScreen.appendChild(ratingScreen);
    
    // Add star rating functionality
    setupStarRating();
}

// Setup star rating
function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingText = document.getElementById('rating-text');
    const submitButton = document.getElementById('submit-rating');
    let selectedRating = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('mouseenter', () => {
            for (let i = 0; i <= index; i++) {
                stars[i].style.color = '#ffd700';
            }
        });
        
        star.addEventListener('mouseleave', () => {
            for (let i = 0; i < stars.length; i++) {
                stars[i].style.color = i < selectedRating ? '#ffd700' : '#666';
            }
        });
        
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            for (let i = 0; i < stars.length; i++) {
                stars[i].style.color = i < selectedRating ? '#ffd700' : '#666';
            }
            
            ratingText.style.opacity = '1';
            submitButton.style.opacity = '1';
            
            const ratings = ['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'];
            ratingText.textContent = `Bạn đánh giá: ${ratings[index]} (${selectedRating}/5 sao)`;
        });
    });
}

// Submit rating
function submitRating() {
    const gameScreen = document.querySelector('.game-screen');
    
    // Remove rating screen
    const ratingScreen = document.querySelector('.rating-screen');
    if (ratingScreen) {
        ratingScreen.remove();
    }
    
    const finalScreen = document.createElement('div');
    finalScreen.className = 'final-screen';
    finalScreen.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    `;
    
    const finalContent = document.createElement('div');
    finalContent.style.cssText = `
        text-align: center;
        color: #ffffff;
        max-width: 500px;
        padding: 20px;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    finalContent.innerHTML = `
        <h2 style="font-family: 'Fernando', sans-serif; font-size: 20px; margin-bottom: 20px; color: #00bfff; line-height: 1.3;">
            Xin cảm ơn bạn đã sử dụng dịch vụ của Vietjet ngày hôm nay.
        </h2>
        <p style="font-family: 'Fernando', sans-serif; font-size: 18px; margin-bottom: 25px; line-height: 1.4;">
            Chúc bạn có 1 chuyến đi vui vẻ và an toàn nhé.
        </p>
        <div style="margin-top: 25px;">
            <!-- <img src="assets/images/mew.gif" alt="Mew" style="width: 80px; height: auto; image-rendering: pixelated;"> -->
            <!-- <img src="assets/images/sylveon.gif" alt="Sylveon" style="width: 80px; height: auto; image-rendering: pixelated; margin-left: 15px;"> -->
        </div>
    `;
    
    finalScreen.appendChild(finalContent);
    gameScreen.appendChild(finalScreen);
    
    // Auto return to loading screen after 5 seconds
    setTimeout(() => {
        returnToLoadingScreen();
    }, 5000);
}

// Helper function to get current DOM elements
function getCurrentElements() {
    return {
        startButton: document.getElementById('startButton'),
        startOverlay: document.getElementById('startOverlay'),
        loadingVideo: document.getElementById('loadingVideo'),
        gameVideo: document.getElementById('gameVideo')
    };
}

// Update global element references to latest objects
function updateGlobalElements() {
    // Since const variables can't be reassigned, we need to use helper functions
    // when accessing elements after DOM reset
}

// Return to loading screen
function returnToLoadingScreen() {
    const gameScreen = document.querySelector('.game-screen');
    
    // Clear all content and restore original structure
    gameScreen.innerHTML = `
        <!-- Video Screen Area -->
        <video id="loadingVideo" class="game-video active" loop muted autoplay playsinline>
            <source src="assets/videos/loading_screen.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        
        <video id="gameVideo" class="game-video" muted playsinline>
            <source src="assets/videos/into_game_view.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        
        <!-- Start Button Overlay -->
        <div id="startOverlay" class="start-overlay">
            <img src="assets/images/logo.png" alt="Vietjet Air" class="game-logo">
            <button id="startButton" class="start-button">
                START
            </button>
        </div>
    `;
    
    // Get the newly created elements
    const newLoadingVideo = gameScreen.querySelector('#loadingVideo');
    const newGameVideo = gameScreen.querySelector('#gameVideo');
    const newStartOverlay = gameScreen.querySelector('#startOverlay');
    const newStartButton = gameScreen.querySelector('#startButton');
    
    // References updated - using new element variables
    
    // Reset overlay state
    newStartOverlay.classList.remove('hidden');
    
    // Reload videos to ensure clean state
    newLoadingVideo.load();
    newGameVideo.load();
    
    // Start the loading video
    newLoadingVideo.play();
    
    // Re-attach event listeners
    newStartButton.addEventListener('click', () => {
        console.log('Start button clicked after reset');
        
        // Hide the start button overlay
        newStartOverlay.classList.add('hidden');
        
        // Reset and hide loading video
        newLoadingVideo.pause();
        newLoadingVideo.currentTime = 0;
        newLoadingVideo.classList.remove('active');
        
        // Reset and show game video
        newGameVideo.currentTime = 0;
        newGameVideo.classList.add('active');
        
        // Play game video with error handling
        newGameVideo.play().catch(err => {
            console.error('Game video play failed:', err);
            // If autoplay fails, try again after a short delay
            setTimeout(() => {
                newGameVideo.play().catch(e => console.error('Retry failed:', e));
            }, 100);
        });
    });
    
    // Re-attach game video event listener
    newGameVideo.addEventListener('ended', () => {
        console.log('Game video ended after reset');
        
        // Hide game video with slide effect
        newGameVideo.style.transform = 'translateX(-100%)';
        newGameVideo.style.transition = 'transform 0.3s ease-in-out';
        
        // Also hide the game screen container
        const gameScreen = document.querySelector('.game-screen');
        gameScreen.style.opacity = '0';
        gameScreen.style.transition = 'opacity 0.3s ease-in-out';
        
        setTimeout(() => {
            newGameVideo.classList.remove('active');
            newGameVideo.style.transform = '';
            newGameVideo.style.transition = '';
            gameScreen.style.display = 'none';
            
            // Show survey notification
            console.log('Starting survey flow...');
            showSurveyNotification();
        }, 300);
    });
    
    // Add error listener for game video
    newGameVideo.addEventListener('error', (e) => {
        console.error('Game video error after reset:', e);
    });
    
    // Add error handlers for the new elements
    addVideoErrorHandlers();
    
    // Reset game state
    gameState = {
        score: 0,
        lives: 3,
        targetScore: 6,
        totalPlanes: 10,
        planesSpawned: 0,
        gameActive: false,
        planes: [],
        collectedPlanes: []
    };
}

// Show miss feedback
function showMissFeedback(x, y) {
    const gameArea = document.querySelector('.game-area');
    const cross = document.createElement('img');
    
    // Get game area position
    const gameAreaRect = gameArea.getBoundingClientRect();
    const relativeX = x - gameAreaRect.left;
    const relativeY = y - gameAreaRect.top;
    
    cross.src = 'assets/images/cross.png';
    cross.style.cssText = `
        position: absolute;
        left: ${relativeX - 15}px;
        top: ${relativeY - 15}px;
        width: 20px;
        height: 20px;
        image-rendering: pixelated;
        z-index: 20;
        opacity: 0;
        animation: crossFade 0.3s ease-out forwards;
    `;
    
    // Add CSS animation if not already added
    if (!document.querySelector('#cross-animation')) {
        const style = document.createElement('style');
        style.id = 'cross-animation';
        style.textContent = `
            @keyframes crossFade {
                0% { 
                    opacity: 0; 
                    transform: scale(0.5); 
                }
                50% { 
                    opacity: 1; 
                    transform: scale(1.2); 
                }
                100% { 
                    opacity: 0; 
                    transform: scale(1); 
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    gameArea.appendChild(cross);
    
    // Remove cross after animation
    setTimeout(() => {
        if (cross.parentNode) {
            cross.parentNode.removeChild(cross);
        }
    }, 1000);
}

// Restart game
function restartGame() {
    // Reset game state
    gameState = {
        score: 0,
        lives: 3,
        targetScore: 6,
        totalPlanes: 10,
        planesSpawned: 0,
        gameActive: false,
        planes: [],
        collectedPlanes: []
    };
    
    // Return to loading screen
    const gameScreen = document.querySelector('.game-screen');
    gameScreen.innerHTML = '';
    
    // Show loading video and start button again
    const currentLoadingVideo = document.getElementById('loadingVideo');
    const currentStartOverlay = document.getElementById('startOverlay');
    
    if (currentLoadingVideo) {
        currentLoadingVideo.classList.add('active');
        currentLoadingVideo.play();
    }
    
    if (currentStartOverlay) {
        currentStartOverlay.classList.remove('hidden');
    }
}

// Handle video errors with current elements
function addVideoErrorHandlers() {
    const currentLoadingVideo = document.getElementById('loadingVideo');
    const currentGameVideo = document.getElementById('gameVideo');
    
    if (currentLoadingVideo) {
        currentLoadingVideo.addEventListener('error', (e) => {
            console.error('Loading video error:', e);
        });
    }
    
    if (currentGameVideo) {
        currentGameVideo.addEventListener('error', (e) => {
            console.error('Game video error:', e);
        });
    }
}

// Add error handlers for initial elements
addVideoErrorHandlers();

// Add click handler to unmute videos if needed
let soundEnabled = false;
document.addEventListener('click', () => {
    if (!soundEnabled) {
        const currentLoadingVideo = document.getElementById('loadingVideo');
        const currentGameVideo = document.getElementById('gameVideo');
        
        if (currentLoadingVideo) {
            currentLoadingVideo.muted = false;
        }
        
        if (currentGameVideo) {
            currentGameVideo.muted = false;
        }
        
        soundEnabled = true;
    }
}, { once: true });

