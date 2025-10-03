// Get DOM elements
const startButton = document.getElementById('startButton');
const startOverlay = document.getElementById('startOverlay');
const loadingVideo = document.getElementById('loadingVideo');
const gameVideo = document.getElementById('gameVideo');

// Audio elements
const loadingSound = document.getElementById('loadingSound');
const gameStartSound = document.getElementById('gameStartSound');
const planeTapSound = document.getElementById('planeTapSound');
const buttonClickSound = document.getElementById('buttonClickSound');
const bonusSound = document.getElementById('bonusSound');
const gameWinSound = document.getElementById('gameWinSound');
const gameOverSound = document.getElementById('gameOverSound');
const gameplayMusic = document.getElementById('gameplayMusic');

// Single tap sound (simplified approach)
let tapSoundLastPlayTime = 0;

// Loading sound state tracking
let loadingSoundPlaying = false;

// Sound Manager
const SoundManager = {
    enabled: true,
    volume: 0.7,
    
    play(audioElement) {
        if (!this.enabled || !audioElement) return;
        
        // Fast play for instant feedback sounds like tap
        audioElement.currentTime = 0;
        audioElement.volume = this.volume;
        
        // Force immediate play for quick sounds
        if (audioElement === planeTapSound || audioElement === bonusSound || audioElement === gameOverSound) {
            audioElement.play().catch(err => {
                console.log('Audio play failed:', err);
            });
        } else {
            // Normal play for music
            audioElement.play().catch(err => {
                console.log('Audio play failed:', err);
            });
        }
    },
    
    stop(audioElement) {
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
        }
    },
    
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopAll();
        }
    },
    
    playTapSound() {
        if (!this.enabled || !planeTapSound) return;
        
        // Prevent rapid overlapping plays
        const now = Date.now();
        if (now - tapSoundLastPlayTime < 50) return; // Min 50ms between plays
        
        // Quick reset and play
        planeTapSound.currentTime = 0;
        planeTapSound.volume = this.volume;
        
        const playPromise = planeTapSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log('Tap sound failed:', err);
            });
        }
        
        tapSoundLastPlayTime = now;
    },
    
    playButtonClick() {
        if (!this.enabled || !buttonClickSound) return;
        
        // Instant button click sound
        buttonClickSound.currentTime = 0;
        buttonClickSound.volume = this.volume;
        
        const playPromise = buttonClickSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(err => {
                console.log('Button click sound failed:', err);
            });
        }
    },
    
    stopAll() {
        this.stop(loadingSound);
        this.stop(gameStartSound);
        this.stop(planeTapSound);
        this.stop(buttonClickSound);
        this.stop(bonusSound);
        this.stop(gameWinSound);
        this.stop(gameOverSound);
        this.stop(gameplayMusic);
    }
};

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
    
    // Add user interaction listener to play audio
    const enableAudio = () => {
        console.log('User interaction detected, enabling audio...');
        
        // Always enable audio on user interaction
        SoundManager.enabled = true;
        
        // Only play loading sound if we're still on loading screen and not already playing
        if (loadingSound && !startOverlay.classList.contains('hidden') && !loadingSoundPlaying) {
            loadingSound.loop = true;
            SoundManager.play(loadingSound);
            loadingSoundPlaying = true;
            console.log('Loading sound played after user interaction');
        } else {
            console.log('Loading sound already playing or not needed, skipping');
        }
        
        console.log('Audio system enabled');
    };
    
    // Listen for user interaction (not once, so it works after F5)
    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('keydown', enableAudio);
    
    // Preload all sounds for instant playback
    const preloadSounds = [
        planeTapSound, buttonClickSound, gameStartSound, gameWinSound, gameOverSound
    ];
    
    preloadSounds.forEach(sound => {
        if (sound) {
            sound.load();
            // Set volume to 0 first to avoid playing
            sound.volume = 0;
            sound.play().catch(() => {
                // Ignore autoplay prevention error
            });
            sound.pause();
            sound.currentTime = 0;
            sound.volume = SoundManager.volume; // Reset volume
        }
    });
    
    // Play loading screen music with better error handling
    console.log('=== AUDIO DEBUG INFO ===');
    console.log('LoadingSound element:', loadingSound);
    console.log('LoadingSound readyState:', loadingSound ? loadingSound.readyState : 'N/A');
    console.log('SoundManager enabled:', SoundManager.enabled);
    console.log('SoundManager volume:', SoundManager.volume);
    
    // Check all audio elements
    const audioElements = [
        { name: 'loadingSound', element: loadingSound },
        { name: 'gameStartSound', element: gameStartSound },
        { name: 'planeTapSound', element: planeTapSound },
        { name: 'buttonClickSound', element: buttonClickSound },
        { name: 'gameWinSound', element: gameWinSound },
        { name: 'gameOverSound', element: gameOverSound },
        { name: 'gameplayMusic', element: gameplayMusic }
    ];
    
    audioElements.forEach(({ name, element }) => {
        console.log(`${name}:`, element ? `Found (readyState: ${element.readyState})` : 'NOT FOUND');
    });
    console.log('========================');
    
    // Force load and play loading sound immediately
    if (loadingSound) {
        loadingSound.load();
        console.log('Loading sound force loaded, readyState:', loadingSound.readyState);
        
        // Ensure loop is enabled
        loadingSound.loop = true;
        console.log('Loading sound loop enabled:', loadingSound.loop);
        
        // Try to play immediately
        try {
            SoundManager.play(loadingSound);
            console.log('Loading sound play attempted immediately');
        } catch (error) {
            console.log('Immediate play failed:', error);
        }
        
        // Wait for audio to be ready, then play
        if (loadingSound.readyState >= 3) { // HAVE_FUTURE_DATA or higher
            SoundManager.play(loadingSound);
            console.log('Loading sound played immediately (ready)');
        } else {
            // Wait for audio to be ready
            loadingSound.addEventListener('canplaythrough', () => {
                console.log('Audio can play through, readyState:', loadingSound.readyState);
                SoundManager.play(loadingSound);
                console.log('Loading sound played after load');
            }, { once: true });
            
            // Fallback timeout
            setTimeout(() => {
                if (loadingSound.readyState > 0) {
                    SoundManager.play(loadingSound);
                    console.log('Loading sound played after timeout');
                } else {
                    console.log('Loading sound still not ready, will wait for user interaction');
                }
            }, 1000);
        }
    } else {
        console.error('Loading sound element not found!');
    }
    
    // Debug mobile elements
    debugMobileElements();
    
    // Additional debug after a delay
    setTimeout(() => {
        if (isMobile()) {
            console.log('Delayed mobile debug...');
            debugMobileElements();
        }
        
        // Retry loading sound after delay if not playing and still on loading screen
        console.log('Checking loading sound after delay...');
        console.log('SoundManager enabled:', SoundManager.enabled);
        if (loadingSound && SoundManager.enabled && !startOverlay.classList.contains('hidden') && !loadingSoundPlaying) {
            console.log('Retrying loading sound playback...');
            SoundManager.play(loadingSound);
            loadingSoundPlaying = true;
        } else {
            console.log('Loading sound already playing or not needed, skipping retry');
        }
        
    }, 1000);
});

// Handle start button click
startButton.addEventListener('click', () => {
    // Enable audio system
    SoundManager.enabled = true;
    
    // Stop loading screen music first
    SoundManager.stop(loadingSound);
    loadingSoundPlaying = false;
    
    // Play game start sound
    SoundManager.play(gameStartSound);
    
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
            <button class="notification-btn" onclick="playButtonSoundAndExecute(startSurvey)">Bắt đầu khảo sát</button>
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

// Button click wrapper with sound
function playButtonSoundAndExecute(callback) {
    SoundManager.playButtonClick();
    callback();
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
                    <button class="answer-btn" onclick="playButtonSoundAndExecute(() => selectAnswer(${index}, ${i}, '${answer}'))">
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
    
    // Stop any existing music and play gameplay background music
    SoundManager.stopAll();
    SoundManager.play(gameplayMusic);
    
    // Create game introduction overlay after screen transition
    setTimeout(() => {
        const introOverlay = document.createElement('div');
        introOverlay.className = 'game-intro-overlay';
        introOverlay.innerHTML = `
            <div class="intro-content">
                <h2>🎮 Chọn chế độ chơi</h2>
                <div style="text-align: center; margin: 20px 0;">
                    <p style="margin-bottom: 20px; font-size: 14px; color: #ffffff;">
                        Chọn một trong 3 chế độ chơi thú vị:
                    </p>
                    
                    <div class="game-modes-container" style="display: flex; flex-direction: column; gap: 15px; margin: 20px 0;">
                        <div class="game-mode-btn" onclick="playButtonSoundAndExecute(() => selectGameMode('standard'))" style="
                            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                            border: 3px solid #2a1a4a;
                            border-radius: 12px;
                            padding: 15px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            text-align: left;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 24px;">🎯</span>
                                <div>
                                    <h3 style="margin: 0; font-size: 16px; color: #ffffff;">Chế độ Chuẩn</h3>
                                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #e0e0e0;">Bắt 6/10 máy bay để thắng</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="game-mode-btn" onclick="playButtonSoundAndExecute(() => selectGameMode('speed'))" style="
                            background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
                            border: 3px solid #2a1a4a;
                            border-radius: 12px;
                            padding: 15px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            text-align: left;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 24px;">⚡</span>
                                <div>
                                    <h3 style="margin: 0; font-size: 16px; color: #ffffff;">Chế độ Tốc độ</h3>
                                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #e0e0e0;">30 giây bắt càng nhiều càng tốt!</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="game-mode-btn" onclick="playButtonSoundAndExecute(() => selectGameMode('challenge'))" style="
                            background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
                            border: 3px solid #2a1a4a;
                            border-radius: 12px;
                            padding: 15px;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            text-align: left;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 24px;">🎮</span>
                                <div>
                                    <h3 style="margin: 0; font-size: 16px; color: #ffffff;">Chế độ Thử thách</h3>
                                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #e0e0e0;">Máy bay có kích thước khác nhau</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        gameScreen.appendChild(introOverlay);
        
        // Fade in overlay
        setTimeout(() => {
            introOverlay.classList.add('active');
        }, 100);
    }, 400);
}

// Game modes
const GAME_MODES = {
    STANDARD: {
        id: 'standard',
        name: 'Chế độ Chuẩn',
        description: 'Bắt 6/10 máy bay để thắng',
        icon: '🎯',
        targetScore: 6,
        totalPlanes: 10,
        lives: 3,
        timeLimit: null,
        planeSpeed: 1.0,
        planeSize: 1.0
    },
    SPEED: {
        id: 'speed',
        name: 'Chế độ Tốc độ',
        description: '30 giây bắt càng nhiều càng tốt!',
        icon: '⚡',
        targetScore: null,
        totalPlanes: null,
        lives: 3,
        timeLimit: 30,
        planeSpeed: 1.5,
        planeSize: 1.0
    },
    CHALLENGE: {
        id: 'challenge',
        name: 'Chế độ Thử thách',
        description: 'Máy bay có kích thước khác nhau',
        icon: '🎮',
        targetScore: 6,
        totalPlanes: 10,
        lives: 3,
        timeLimit: null,
        planeSpeed: 1.0,
        planeSize: 'variable'
    }
};

// Game state
let gameState = {
    mode: 'standard',
    score: 0,
    lives: 3,
    targetScore: 6,
    totalPlanes: 10,
    planesSpawned: 0,
    gameActive: false,
    planes: [],
    collectedPlanes: [],
    timeLeft: null,
    gameTimer: null
};

// Select game mode
function selectGameMode(modeId) {
    console.log('Selected game mode:', modeId);
    
    // Update game state with selected mode
    const mode = GAME_MODES[modeId.toUpperCase()];
    gameState.mode = modeId;
    gameState.targetScore = mode.targetScore;
    gameState.totalPlanes = mode.totalPlanes;
    gameState.lives = mode.lives;
    gameState.timeLeft = mode.timeLimit;
    
    // Hide intro overlay
    const introOverlay = document.querySelector('.game-intro-overlay');
    if (introOverlay) {
        introOverlay.classList.remove('active');
        setTimeout(() => {
            introOverlay.remove();
        }, 300);
    }
    
    // Initialize game with selected mode
    initializeGame();
}

// Start game (legacy function for backward compatibility)
function startGame() {
    selectGameMode('standard');
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
    
    // Start timer for speed mode
    if (gameState.mode === 'speed' && gameState.timeLeft !== null) {
        startGameTimer();
    }
    
    console.log('Game started with mode:', gameState.mode, 'survey answers:', surveyAnswers);
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
    
    // Update score display based on game mode
    if (gameState.mode === 'speed') {
        scoreDisplay.innerHTML = `Score: ${gameState.score}`;
    } else {
        scoreDisplay.innerHTML = `${gameState.score}/${gameState.targetScore}`;
    }
    
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
    
    // Create timer display for speed mode
    if (gameState.mode === 'speed' && gameState.timeLeft !== null) {
        const timerDisplay = document.createElement('div');
        timerDisplay.className = 'timer-display';
        timerDisplay.innerHTML = `Time: ${gameState.timeLeft}s`;
        timerDisplay.style.cssText = `
            position: absolute;
            top: 60px;
            right: 20px;
            color: #ffd700;
            font-family: 'Press Start 2P', cursive;
            font-size: 12px;
            text-shadow: 2px 2px 0px #000000;
            z-index: 10;
        `;
        gameScreen.appendChild(timerDisplay);
    }
    
    // Create global health bar for challenge mode
    if (gameState.mode === 'challenge') {
        const globalHealthContainer = document.createElement('div');
        globalHealthContainer.className = 'global-health-container';
        globalHealthContainer.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 200px;
            height: 20px;
            background: rgba(0, 0, 0, 0.7);
            border: 2px solid #ffffff;
            border-radius: 10px;
            z-index: 10;
            overflow: hidden;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        
        const globalHealthBar = document.createElement('div');
        globalHealthBar.className = 'global-health-bar';
        globalHealthBar.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50 0%, #FF9800 50%, #F44336 100%);
            transition: width 0.3s ease;
            border-radius: 8px;
        `;
        
        const globalHealthLabel = document.createElement('div');
        globalHealthLabel.className = 'global-health-label';
        globalHealthLabel.innerHTML = 'Target Health';
        globalHealthLabel.style.cssText = `
            position: absolute;
            top: -25px;
            left: 0;
            color: #ffffff;
            font-family: 'Press Start 2P', cursive;
            font-size: 8px;
            text-shadow: 1px 1px 0px #000000;
        `;
        
        globalHealthContainer.appendChild(globalHealthBar);
        globalHealthContainer.appendChild(globalHealthLabel);
        gameScreen.appendChild(globalHealthContainer);
        
        // Store reference for updates
        gameState.globalHealthBar = globalHealthBar;
        gameState.globalHealthContainer = globalHealthContainer;
        gameState.currentTargetPlane = null;
    }
    
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

// Start game timer for speed mode
function startGameTimer() {
    gameState.gameTimer = setInterval(() => {
        gameState.timeLeft--;
        const timerDisplay = document.querySelector('.timer-display');
        if (timerDisplay) {
            timerDisplay.innerHTML = `Time: ${gameState.timeLeft}s`;
        }
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.gameTimer);
            // Speed mode: time's up - player wins automatically
            gameWin();
        }
    }, 1000);
}

// Spawn planes randomly
function spawnPlanes() {
    if (!gameState.gameActive) return;
    
    // For speed mode, spawn continuously until time runs out
    if (gameState.mode === 'speed') {
        const plane = createPlane();
        gameState.planes.push(plane);
        
        // Schedule next plane spawn (faster for speed mode)
        const spawnDelay = Math.random() * 800 + 300; // 0.3-1.1 seconds
        setTimeout(() => {
            if (gameState.gameActive) {
                spawnPlanes();
            }
        }, spawnDelay);
        return;
    }
    
    // For other modes, spawn limited number of planes
    if (gameState.planesSpawned >= gameState.totalPlanes) return;
    
    // Create a new plane
    const plane = createPlane();
    gameState.planes.push(plane);
    gameState.planesSpawned++;
    
    // Schedule next plane spawn if we haven't reached the limit
    if (gameState.planesSpawned < gameState.totalPlanes) {
        const spawnDelay = Math.random() * 1500 + 500; // 0.5-2 seconds
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
    
    // Get current game mode
    const mode = GAME_MODES[gameState.mode.toUpperCase()];
    
    // Responsive sizing based on screen width and game mode
    const screenWidth = window.innerWidth;
    let planeSize = 60; // Default size
    
    // Challenge mode: variable plane sizes
    if (gameState.mode === 'challenge') {
        const sizeTypes = [
            { size: 40, taps: 1, color: '#4CAF50' }, // Small - 1 tap
            { size: 60, taps: 2, color: '#FF9800' }, // Medium - 2 taps
            { size: 80, taps: 3, color: '#F44336' }, // Large - 3 taps
            { size: 100, taps: 5, color: '#9C27B0' } // Extra Large - 5 taps
        ];
        const selectedType = sizeTypes[Math.floor(Math.random() * sizeTypes.length)];
        planeSize = selectedType.size;
        plane.tapsRequired = selectedType.taps;
        plane.tapsCount = 0;
        plane.sizeType = selectedType;
    } else {
        // Standard and Speed modes: normal sizing
        if (screenWidth <= 320) {
            planeSize = 40;
        } else if (screenWidth <= 480) {
            planeSize = 50;
        } else if (screenWidth <= 768) {
            planeSize = 60;
        } else {
            planeSize = 75;
        }
        plane.tapsRequired = 1;
        plane.tapsCount = 0;
    }
    
    // Apply mode-specific speed multiplier
    const speedMultiplier = mode.planeSpeed;
    
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
    
    // Add health bar for challenge mode
    if (gameState.mode === 'challenge') {
        // Create health bar container
        const healthBarContainer = document.createElement('div');
        healthBarContainer.className = 'health-bar-container';
        healthBarContainer.style.cssText = `
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            width: ${planeSize}px;
            height: 8px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 4px;
            border: 1px solid #ffffff;
            z-index: 7;
            overflow: hidden;
        `;
        
        // Create health bar
        const healthBar = document.createElement('div');
        healthBar.className = 'health-bar';
        healthBar.style.cssText = `
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #4CAF50 0%, #FF9800 50%, #F44336 100%);
            transition: width 0.3s ease;
            border-radius: 3px;
        `;
        
        healthBarContainer.appendChild(healthBar);
        plane.appendChild(healthBarContainer);
        
        // Store references
        plane.healthBar = healthBar;
        plane.healthBarContainer = healthBarContainer;
    }
    
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
    
    // Animate plane movement with mode-specific speed
    const baseDuration = Math.random() * 2000 + 3000; // 3-5 seconds base
    const animationDuration = baseDuration / speedMultiplier; // Faster for speed mode
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
    
    // Challenge mode: handle multiple taps
    if (gameState.mode === 'challenge') {
        plane.tapsCount++;
        
        // Set this plane as current target if it's the first tap
        if (plane.tapsCount === 1 && !gameState.currentTargetPlane) {
            gameState.currentTargetPlane = plane;
            updateGlobalHealthBar();
        }
        
        // Update individual plane health bar
        if (plane.healthBar) {
            const healthPercent = ((plane.tapsRequired - plane.tapsCount) / plane.tapsRequired) * 100;
            plane.healthBar.style.width = `${healthPercent}%`;
            
            // Change color based on health
            if (healthPercent > 66) {
                plane.healthBar.style.background = 'linear-gradient(90deg, #4CAF50 0%, #4CAF50 100%)';
            } else if (healthPercent > 33) {
                plane.healthBar.style.background = 'linear-gradient(90deg, #FF9800 0%, #FF9800 100%)';
            } else {
                plane.healthBar.style.background = 'linear-gradient(90deg, #F44336 0%, #F44336 100%)';
            }
        }
        
        // Update global health bar if this is the current target
        if (gameState.currentTargetPlane === plane) {
            updateGlobalHealthBar();
        }
        
        // Play plane tap sound (instant)
        SoundManager.playTapSound();
        
        // Check if enough taps
        if (plane.tapsCount < plane.tapsRequired) {
            return; // Need more taps
        }
        
        // Hide individual health bar when plane is caught
        if (plane.healthBarContainer) {
            plane.healthBarContainer.style.opacity = '0';
            plane.healthBarContainer.style.transition = 'opacity 0.5s ease';
        }
        
        // Clear current target if this plane is caught
        if (gameState.currentTargetPlane === plane) {
            gameState.currentTargetPlane = null;
            hideGlobalHealthBar();
        }
    } else {
        // Standard and Speed modes: single tap
        // Play plane tap sound (instant)
        SoundManager.playTapSound();
    }
    
    // Mark plane as caught to prevent life loss
    plane.classList.add('caught');
    plane.classList.remove('flying-plane');
    plane.style.pointerEvents = 'none';
    plane.style.transition = 'opacity 0.5s ease';
    plane.style.opacity = '0';
    
    // Add to collected planes
    gameState.score++;
    gameState.collectedPlanes.push(plane);
    
    // Update score display based on mode
    const scoreDisplay = document.querySelector('.score-display');
    if (gameState.mode === 'speed') {
        scoreDisplay.innerHTML = `Score: ${gameState.score}`;
    } else {
        scoreDisplay.innerHTML = `${gameState.score}/${gameState.targetScore}`;
    }
    
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
    
    // Check win condition based on game mode
    if (gameState.mode === 'speed') {
        // Speed mode: timer handles win condition
        // No need to check here
    } else {
        // Standard and Challenge modes: check target score
        if (gameState.score >= gameState.targetScore) {
            gameWin();
        }
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

// Update global health bar for challenge mode
function updateGlobalHealthBar() {
    if (gameState.mode !== 'challenge' || !gameState.currentTargetPlane || !gameState.globalHealthBar) {
        return;
    }
    
    const plane = gameState.currentTargetPlane;
    const healthPercent = ((plane.tapsRequired - plane.tapsCount) / plane.tapsRequired) * 100;
    
    // Update health bar width
    gameState.globalHealthBar.style.width = `${healthPercent}%`;
    
    // Change color based on health
    if (healthPercent > 66) {
        gameState.globalHealthBar.style.background = 'linear-gradient(90deg, #4CAF50 0%, #4CAF50 100%)';
    } else if (healthPercent > 33) {
        gameState.globalHealthBar.style.background = 'linear-gradient(90deg, #FF9800 0%, #FF9800 100%)';
    } else {
        gameState.globalHealthBar.style.background = 'linear-gradient(90deg, #F44336 0%, #F44336 100%)';
    }
    
    // Show the global health bar
    if (gameState.globalHealthContainer) {
        gameState.globalHealthContainer.style.opacity = '1';
    }
}

// Hide global health bar
function hideGlobalHealthBar() {
    if (gameState.globalHealthContainer) {
        gameState.globalHealthContainer.style.opacity = '0';
    }
}

// Game win
function gameWin() {
    gameState.gameActive = false;
    
    // Clear game timer if running
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
        gameState.gameTimer = null;
    }
    
    // Play game win sound and stop gameplay music
    SoundManager.stop(gameplayMusic);
    SoundManager.play(gameWinSound);
    
    console.log('You won! Mode:', gameState.mode, 'Score:', gameState.score);
    showWinScreen();
}

// Game lose
function gameLose() {
    gameState.gameActive = false;
    
    // Clear game timer if running
    if (gameState.gameTimer) {
        clearInterval(gameState.gameTimer);
        gameState.gameTimer = null;
    }
    
    // Play game over sound and stop gameplay music
    SoundManager.stop(gameplayMusic);
    SoundManager.play(gameOverSound);
    
    console.log('You lost! Mode:', gameState.mode, 'Score:', gameState.score);
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
        background: rgba(0, 0, 0, 0.95);
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
            Chúc mừng! Bạn đã hoàn thành ${GAME_MODES[gameState.mode.toUpperCase()].icon} ${GAME_MODES[gameState.mode.toUpperCase()].name}
        </h2>
        <p style="font-family: 'Fernando', sans-serif; font-size: 14px; margin-bottom: 10px; line-height: 1.4;">
            ${gameState.mode === 'speed' ? 
                `Điểm số: ${gameState.score} máy bay trong 30 giây!` : 
                `Bạn đã bắt được ${gameState.score}/${gameState.targetScore} máy bay!`
            }
        </p>
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
        <button onclick="playButtonSoundAndExecute(showRatingScreen)" style="
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
        background: rgba(0, 0, 0, 0.95);
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
            ${GAME_MODES[gameState.mode.toUpperCase()].icon} ${GAME_MODES[gameState.mode.toUpperCase()].name} - Thử lại nhé!
        </h2>
        <p style="font-family: 'Fernando', sans-serif; font-size: 14px; margin-bottom: 10px; line-height: 1.4;">
            ${gameState.mode === 'speed' ? 
                `Điểm số: ${gameState.score} máy bay` : 
                `Bạn đã bắt được ${gameState.score}/${gameState.targetScore} máy bay`
            }
        </p>
        <p style="font-family: 'Fernando', sans-serif; font-size: 16px; margin-bottom: 25px; line-height: 1.4;">
            Không sao, Vietjet vẫn luôn đồng hành cùng bạn trong mọi hành trình!
        </p>
        <button onclick="playButtonSoundAndExecute(showRatingScreen)" style="
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
        background: rgba(0, 0, 0, 0.95);
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
        <button id="submit-rating" onclick="playButtonSoundAndExecute(submitRating)" style="
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
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;
    `;
    
    const finalContent = document.createElement('div');
    finalContent.style.cssText = `
        text-align: center;
        color: #ffffff;
        max-width: 600px;
        padding: 20px;
        max-height: 90vh;
        overflow-y: auto;
    `;
    
    finalContent.innerHTML = `
        <div style="margin-bottom: clamp(15px, 2vh, 25px); text-align: center;">
            <img src="assets/images/contryside.png" alt="Countryside" style="
                width: clamp(300px, 25vw, 500px);
                height: auto;
                border-radius: clamp(6px, 0.5vw, 12px);
                border: clamp(2px, 0.2vw, 4px) solid #ffffff;
                box-shadow: 0 clamp(2px, 0.2vw, 4px) clamp(8px, 1vw, 16px) rgba(0,0,0,0.2);
                opacity: 0.9;
            ">
        </div>
        <h2 style="font-family: 'Fernando', sans-serif; font-size: clamp(16px, 2.5vw, 24px); margin-bottom: clamp(15px, 2vh, 25px); color: #00bfff; line-height: 1.3;">
            Xin cảm ơn bạn đã sử dụng dịch vụ của Vietjet ngày hôm nay.
        </h2>
        <p style="font-family: 'Fernando', sans-serif; font-size: clamp(14px, 2vw, 20px); margin-bottom: clamp(20px, 2.5vh, 30px); line-height: 1.4;">
            Chúc bạn có 1 chuyến đi vui vẻ và an toàn nhé.
        </p>
        <div style="margin-top: 25px;">
            <!-- <img src="assets/images/mew.gif" alt="Mew" rstyle="width: 80px; height: auto; image-rendering: pixelated;"> -->
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
    
    // Play loading screen music again with loop
    SoundManager.stopAll();
    if (loadingSound) {
        loadingSound.loop = true;
        SoundManager.play(loadingSound);
        loadingSoundPlaying = true;
    }
    
    // Re-attach event listeners
    newStartButton.addEventListener('click', () => {
        console.log('Start button clicked after reset');
        
        // Enable audio system
        SoundManager.enabled = true;
        
        // Stop loading screen music first
        SoundManager.stop(loadingSound);
        loadingSoundPlaying = false;
        
        // Play game start sound
        SoundManager.play(gameStartSound);
        
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

