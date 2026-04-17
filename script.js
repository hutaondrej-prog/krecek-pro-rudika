let currentTask = 0;
const totalTasks = 2; // Pouze úkol 3 a 4
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'correct':
            oscillator.frequency.value = 523.25;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'success':
            oscillator.frequency.value = 659.25;
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
            break;
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function updateProgress() {
    const progress = (currentTask / totalTasks) * 100;
    document.getElementById('progress').style.width = progress + '%';
}

function startGame() {
    playSound('correct');
    setTimeout(() => {
        showScreen('task3-screen');
        initTask3();
        updateProgress();
    }, 500);
}

function nextTask() {
    playSound('success');
    currentTask++;
    updateProgress();
    
    if (currentTask === 1) {
        showScreen('task4-screen');
        initTask4();
    } else if (currentTask === 2) {
        showScreen('final-screen');
    }
}

function showVideo() {
    showScreen('video-screen');
    document.getElementById('hamster-video').play();
    updateProgress();
}

// ===== ÚKOL 3: PUZZLE =====
function initTask3() {
    const puzzleGrid = document.getElementById('puzzleGrid');
    let tiles = [];
    let selectedTile = null;
    const correctOrder = [0, 1, 2, 3, 4, 5];
    let currentOrder = [...correctOrder];
    
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    do {
        currentOrder = shuffle(correctOrder);
    } while (currentOrder.every((val, idx) => val === correctOrder[idx]));
    
    puzzleGrid.innerHTML = '';
    tiles = [];
    
    currentOrder.forEach((tileNumber, position) => {
        const tile = document.createElement('div');
        tile.className = 'puzzle-tile';
        tile.dataset.tile = tileNumber;
        tile.dataset.position = position;
        tile.style.backgroundImage = 'url(hamster-puzzle.png)';
        
        tile.addEventListener('click', () => {
            if (selectedTile === null) {
                selectedTile = { tile, position };
                tile.classList.add('selected');
                playSound('correct');
            } else if (selectedTile.position === position) {
                selectedTile.tile.classList.remove('selected');
                selectedTile = null;
            } else {
                const firstTile = selectedTile.tile;
                const firstPos = selectedTile.position;
                const secondTile = tile;
                const secondPos = position;
                
                firstTile.classList.add('swapping');
                secondTile.classList.add('swapping');
                firstTile.classList.remove('selected');
                playSound('correct');
                
                setTimeout(() => {
                    const temp = firstTile.dataset.tile;
                    firstTile.dataset.tile = secondTile.dataset.tile;
                    secondTile.dataset.tile = temp;
                    
                    [currentOrder[firstPos], currentOrder[secondPos]] = 
                    [currentOrder[secondPos], currentOrder[firstPos]];
                    
                    firstTile.classList.remove('swapping');
                    secondTile.classList.remove('swapping');
                    
                    const isComplete = currentOrder.every((val, idx) => val === correctOrder[idx]);
                    if (isComplete) {
                        playSound('success');
                        setTimeout(() => {
                            document.querySelector('#task3-screen .next-button').classList.add('show');
                        }, 500);
                    }
                    
                    selectedTile = null;
                }, 400);
            }
        });
        
        puzzleGrid.appendChild(tile);
        tiles[position] = tile;
    });
}

// ===== ÚKOL 4: CHYTÁNÍ SEMÍNEK =====
function initTask4() {
    const gameArea = document.getElementById('gameArea');
    const bowl = document.getElementById('bowl');
    const bowlContainer = document.getElementById('bowlContainer');
    const scoreDisplay = document.getElementById('seedScore');
    
    let score = 0;
    const targetScore = 10;
    let seedInterval;
    let activeSeedsCount = 0;
    const maxActiveSeeds = 3;
    
    let isDragging = false;
    let bowlX = window.innerWidth / 2 - 100;
    
    bowlContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
    }, { passive: false });
    
    bowlContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        bowlX = touch.clientX - 100;
        const maxX = window.innerWidth - 200;
        bowlX = Math.max(0, Math.min(bowlX, maxX));
        bowlContainer.style.left = bowlX + 'px';
        bowlContainer.style.transform = 'translateX(0)';
    }, { passive: false });
    
    bowlContainer.addEventListener('touchend', () => {
        isDragging = false;
    });
    
    bowlContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        bowlX = e.clientX - 100;
        const maxX = window.innerWidth - 200;
        bowlX = Math.max(0, Math.min(bowlX, maxX));
        bowlContainer.style.left = bowlX + 'px';
        bowlContainer.style.transform = 'translateX(0)';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
    
    function createSeed() {
        if (activeSeedsCount >= maxActiveSeeds || score >= targetScore) return;
        
        const seed = document.createElement('div');
        seed.className = 'seed';
        seed.textContent = '🌻';
        seed.style.left = Math.random() * (window.innerWidth - 60) + 'px';
        seed.style.top = '-60px';
        
        gameArea.appendChild(seed);
        activeSeedsCount++;
        
        const fallSpeed = 2 + Math.random() * 2;
        let seedY = -60;
        
        const fallInterval = setInterval(() => {
            seedY += fallSpeed;
            seed.style.top = seedY + 'px';
            
            const seedRect = seed.getBoundingClientRect();
            const bowlRect = bowl.getBoundingClientRect();
            
            const isColliding = !(
                seedRect.right < bowlRect.left ||
                seedRect.left > bowlRect.right ||
                seedRect.bottom < bowlRect.top ||
                seedRect.top > bowlRect.bottom
            );
            
            if (isColliding && !seed.classList.contains('caught')) {
                seed.classList.add('caught');
                clearInterval(fallInterval);
                score++;
                scoreDisplay.textContent = score;
                playSound('correct');
                
                setTimeout(() => {
                    seed.remove();
                    activeSeedsCount--;
                }, 400);
                
                if (score >= targetScore) {
                    setTimeout(() => {
                        playSound('success');
                        document.querySelector('#task4-screen .next-button').classList.add('show');
                    }, 500);
                    clearInterval(seedInterval);
                }
            } else if (seedY > window.innerHeight) {
                clearInterval(fallInterval);
                seed.remove();
                activeSeedsCount--;
            }
        }, 16);
    }
    
    setTimeout(() => {
        seedInterval = setInterval(createSeed, 1500);
    }, 1000);
}
