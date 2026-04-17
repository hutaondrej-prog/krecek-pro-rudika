let currentTask = 0;
const totalTasks = 5;
let gameState = {
    task1: { fedCount: 0, required: 3 },
    task2: { scratchedPercent: 0 },
    task3: { completed: false },
    task4: { score: 0, required: 5 },
    task5: { ballsClicked: 0, required: 5 }
};

// Audio instrukce pro každý úkol (použijeme AI generovaný hlas nebo můžeš nahrát vlastní)
const audioInstructions = {
    intro: "Ahoj Rudíku! Pomůžeš mi najít mého kamaráda křečka? Klikni na start!",
    task1: "Nakrm mě! Přetáhni jídlo do mé mističky. Ale pozor, já nejím boty ani autíčka!",
    task2: "Schoval jsem se v hoblinách! Najdeš mě? Zkus mě najít prstem!",
    task3: "Pomůžeš mi složit obrázek? Přetáhni dílky na správné místo!",
    task4: "Mám hlad! Pomůžeš mi chytit padající semínka? Ťukej na ně prstem!",
    task5: "Brrr, je mi zima! Pomůžeš mi zahřát? Klikej na barevná klubíčka!",
    final: "Hurá! Zvládl jsi všechny úkoly! Mám pro tebe překvapení! Klikni na dárek!"
};

// Funkce pro spuštění hry
function startGame() {
    playSound('start');
    setTimeout(() => {
        showScreen('task1-screen');
        initTask1();
        updateProgress();
    }, 500);
}

// Funkce pro zobrazení další obrazovky
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Aktualizace progress baru
function updateProgress() {
    const progress = (currentTask / totalTasks) * 100;
    document.getElementById('progress').style.width = progress + '%';
}

// Přechod na další úkol
function nextTask() {
    playSound('success');
    currentTask++;
    updateProgress();
    
    if (currentTask === 1) {
        showScreen('task2-screen');
        initTask2();
    } else if (currentTask === 2) {
        showScreen('task3-screen');
        initTask3();
    } else if (currentTask === 3) {
        showScreen('task4-screen');
        initTask4();
    } else if (currentTask === 4) {
        showScreen('task5-screen');
        initTask5();
    } else if (currentTask === 5) {
        showScreen('final-screen');
    }
}

// Zobrazení videa
function showVideo() {
    showScreen('video-screen');
    document.getElementById('hamster-video').play();
    updateProgress();
}

// ===== ÚKOL 1: NAKRM KŘEČKA =====
function initTask1() {
    const foodItems = document.querySelectorAll('.food-item');
    const bowl = document.getElementById('bowl');
    
    foodItems.forEach(item => {
        // Touch events
        item.addEventListener('touchstart', handleDragStart, false);
        item.addEventListener('touchmove', handleDragMove, false);
        item.addEventListener('touchend', handleDragEnd, false);
        
        // Mouse events
        item.addEventListener('mousedown', handleDragStart, false);
        item.addEventListener('mousemove', handleDragMove, false);
        item.addEventListener('mouseup', handleDragEnd, false);
    });
    
    let draggedElement = null;
    let startX, startY;
    
    function handleDragStart(e) {
        draggedElement = this;
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX - this.offsetLeft;
        startY = touch.clientY - this.offsetTop;
        this.style.position = 'absolute';
        this.style.zIndex = '1000';
    }
    
    function handleDragMove(e) {
        if (!draggedElement) return;
        e.preventDefault();
        const touch = e.touches ? e.touches[0] : e;
        draggedElement.style.left = (touch.clientX - startX) + 'px';
        draggedElement.style.top = (touch.clientY - startY) + 'px';
    }
    
    function handleDragEnd(e) {
        if (!draggedElement) return;
        
        const bowlRect = bowl.getBoundingClientRect();
        const itemRect = draggedElement.getBoundingClientRect();
        
        // Kontrola, zda je jídlo nad miskou
        const isOverBowl = !(itemRect.right < bowlRect.left || 
                            itemRect.left > bowlRect.right || 
                            itemRect.bottom < bowlRect.top || 
                            itemRect.top > bowlRect.bottom);
        
        if (isOverBowl) {
            const isCorrectFood = draggedElement.dataset.food === 'true';
            
            if (isCorrectFood) {
                draggedElement.classList.add('correct');
                playSound('correct');
                gameState.task1.fedCount++;
                
                setTimeout(() => {
                    draggedElement.style.display = 'none';
                }, 500);
                
                // Animace křečka
                const hamster = document.getElementById('hamster1');
                hamster.style.animation = 'none';
                setTimeout(() => {
                    hamster.style.animation = 'bounce 0.5s 3';
                }, 10);
                
                // Kontrola dokončení úkolu
                if (gameState.task1.fedCount >= gameState.task1.required) {
                    setTimeout(() => {
                        document.querySelector('#task1-screen .next-button').classList.add('show');
                    }, 1000);
                }
            } else {
                draggedElement.classList.add('wrong');
                playSound('wrong');
                setTimeout(() => {
                    draggedElement.classList.remove('wrong');
                    draggedElement.style.position = 'relative';
                    draggedElement.style.left = '0';
                    draggedElement.style.top = '0';
                }, 500);
            }
        } else {
            draggedElement.style.position = 'relative';
            draggedElement.style.left = '0';
            draggedElement.style.top = '0';
        }
        
        draggedElement = null;
    }
}

// ===== ÚKOL 2: STÍRACÍ LOS =====
function initTask2() {
    const canvas = document.getElementById('scratch-canvas');
    const container = canvas.parentElement;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Vykreslení textu hoblin
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Přidání textury
    for (let i = 0; i < 200; i++) {
        ctx.fillStyle = `rgba(139, 110, 99, ${Math.random() * 0.5})`;
        ctx.fillRect(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 20 + 5,
            Math.random() * 5 + 2
        );
    }
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    function scratch(x, y) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Kontrola, kolik bylo odkryto
        checkScratchProgress();
    }
    
    function checkScratchProgress() {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;
        
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 128) {
                transparentPixels++;
            }
        }
        
        const totalPixels = pixels.length / 4;
        const scratchedPercent = (transparentPixels / totalPixels) * 100;
        
        if (scratchedPercent > 60 && !gameState.task2.completed) {
            gameState.task2.completed = true;
            playSound('success');
            canvas.style.opacity = '0';
            setTimeout(() => {
                document.querySelector('#task2-screen .next-button').classList.add('show');
            }, 500);
        }
    }
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isDrawing = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        lastX = touch.clientX - rect.left;
        lastY = touch.clientY - rect.top;
        scratch(lastX, lastY);
    });
    
    canvas.addEventListener('touchmove', (e) => {
        if (!isDrawing) return;
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        ctx.lineWidth = 80;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX = x;
        lastY = y;
        scratch(x, y);
    });
    
    canvas.addEventListener('touchend', () => {
        isDrawing = false;
    });
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
        scratch(lastX, lastY);
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineWidth = 80;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        lastX = x;
        lastY = y;
        scratch(x, y);
    });
    
    canvas.addEventListener('mouseup', () => {
        isDrawing = false;
    });
}

// ===== ÚKOL 3: PUZZLE =====
function initTask3() {
    const container = document.getElementById('puzzleContainer');
    const containerRect = container.getBoundingClientRect();
    
    const pieces = [
        { id: 1, emoji: '🐹', x: 50, y: 50, slotX: containerRect.width * 0.1, slotY: containerRect.height * 0.2 },
        { id: 2, emoji: '🐾', x: containerRect.width - 150, y: 50, slotX: containerRect.width * 0.5, slotY: containerRect.height * 0.2 },
        { id: 3, emoji: '❤️', x: containerRect.width / 2 - 50, y: containerRect.height - 150, slotX: containerRect.width * 0.3, slotY: containerRect.height * 0.6 }
    ];
    
    let completedPieces = 0;
    
    pieces.forEach(piece => {
        // Vytvoření slotu
        const slot = document.createElement('div');
        slot.className = 'puzzle-slot';
        slot.style.left = piece.slotX + 'px';
        slot.style.top = piece.slotY + 'px';
        slot.style.width = '150px';
        slot.style.height = '150px';
        slot.dataset.pieceId = piece.id;
        container.appendChild(slot);
        
        // Vytvoření dílku
        const pieceElement = document.createElement('div');
        pieceElement.className = 'puzzle-piece';
        pieceElement.textContent = piece.emoji;
        pieceElement.style.left = piece.x + 'px';
        pieceElement.style.top = piece.y + 'px';
        pieceElement.style.width = '150px';
        pieceElement.style.height = '150px';
        pieceElement.style.fontSize = '100px';
        pieceElement.style.display = 'flex';
        pieceElement.style.justifyContent = 'center';
        pieceElement.style.alignItems = 'center';
        pieceElement.dataset.pieceId = piece.id;
        container.appendChild(pieceElement);
        
        let isDragging = false;
        let offsetX, offsetY;
        
        function startDrag(e) {
            isDragging = true;
            const touch = e.touches ? e.touches[0] : e;
            offsetX = touch.clientX - pieceElement.offsetLeft;
            offsetY = touch.clientY - pieceElement.offsetTop;
            pieceElement.style.zIndex = '1000';
        }
        
        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const containerRect = container.getBoundingClientRect();
            pieceElement.style.left = (touch.clientX - containerRect.left - offsetX) + 'px';
            pieceElement.style.top = (touch.clientY - containerRect.top - offsetY) + 'px';
        }
        
        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            
            const slot = document.querySelector(`.puzzle-slot[data-piece-id="${piece.id}"]`);
            const slotRect = slot.getBoundingClientRect();
            const pieceRect = pieceElement.getBoundingClientRect();
            
            const distance = Math.sqrt(
                Math.pow(pieceRect.left - slotRect.left, 2) + 
                Math.pow(pieceRect.top - slotRect.top, 2)
            );
            
            if (distance < 100) {
                pieceElement.style.left = slot.offsetLeft + 'px';
                pieceElement.style.top = slot.offsetTop + 'px';
                pieceElement.style.cursor = 'default';
                pieceElement.style.pointerEvents = 'none';
                completedPieces++;
                playSound('correct');
                
                if (completedPieces === pieces.length) {
                    setTimeout(() => {
                        document.querySelector('#task3-screen .next-button').classList.add('show');
                    }, 500);
                }
            }
        }
        
        pieceElement.addEventListener('touchstart', startDrag);
        pieceElement.addEventListener('touchmove', drag);
        pieceElement.addEventListener('touchend', endDrag);
        pieceElement.addEventListener('mousedown', startDrag);
        pieceElement.addEventListener('mousemove', drag);
        pieceElement.addEventListener('mouseup', endDrag);
    });
}

// ===== ÚKOL 4: CHYŤ SEMÍNKO =====
function initTask4() {
    const gameArea = document.getElementById('catchGame');
    let seedInterval;
    
    function createSeed() {
        if (gameState.task4.score >= gameState.task4.required) {
            clearInterval(seedInterval);
            return;
        }
        
        const seed = document.createElement('div');
        seed.className = 'seed';
        seed.textContent = '🌻';
        seed.style.left = Math.random() * (window.innerWidth - 100) + 'px';
        seed.style.animationDuration = (Math.random() * 2 + 3) + 's';
        gameArea.appendChild(seed);
        
        seed.addEventListener('click', catchSeed);
        seed.addEventListener('touchstart', (e) => {
            e.preventDefault();
            catchSeed.call(seed);
        });
        
        function catchSeed() {
            gameState.task4.score++;
            document.getElementById('seedScore').textContent = gameState.task4.score;
            playSound('pop');
            
            this.style.animation = 'none';
            this.style.transform = 'scale(1.5)';
            this.style.opacity = '0';
            
            setTimeout(() => {
                this.remove();
            }, 300);
            
            if (gameState.task4.score >= gameState.task4.required) {
                clearInterval(seedInterval);
                setTimeout(() => {
                    document.querySelector('#task4-screen .next-button').classList.add('show');
                }, 1000);
            }
        }
        
        setTimeout(() => {
            seed.remove();
        }, 5000);
    }
    
    seedInterval = setInterval(createSeed, 1500);
}

// ===== ÚKOL 5: UDĚLEJ TEPLO =====
function initTask5() {
    const colorBalls = document.querySelectorAll('.color-ball');
    const house = document.getElementById('house');
    const cottonOverlay = document.getElementById('cottonOverlay');
    
    colorBalls.forEach(ball => {
        ball.addEventListener('click', addCotton);
        ball.addEventListener('touchstart', (e) => {
            e.preventDefault();
            addCotton.call(ball);
        });
    });
    
    function addCotton() {
        if (this.classList.contains('used')) return;
        
        this.classList.add('used');
        this.style.opacity = '0.3';
        this.style.transform = 'scale(0.5)';
        playSound('pop');
        
        const cotton = document.createElement('div');
        cotton.className = 'cotton-piece';
        cotton.textContent = '☁️';
        cotton.style.left = Math.random() * 80 + '%';
        cotton.style.top = Math.random() * 80 + '%';
        cottonOverlay.appendChild(cotton);
        
        gameState.task5.ballsClicked++;
        
        if (gameState.task5.ballsClicked >= gameState.task5.required) {
            house.classList.remove('cold');
            house.classList.add('warm');
            
            setTimeout(() => {
                document.querySelector('#task5-screen .next-button').classList.add('show');
            }, 1000);
        }
    }
}

// ===== ZVUKOVÉ EFEKTY =====
function playSound(type) {
    // Vytvoření jednoduchých zvuků pomocí Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'correct':
            oscillator.frequency.value = 523.25; // C5
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'wrong':
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'success':
            oscillator.frequency.value = 659.25; // E5
            oscillator.type = 'triangle';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            break;
        case 'pop':
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
            break;
        case 'start':
            oscillator.frequency.value = 440;
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
    }
}

// Audio button
document.getElementById('audioBtn').addEventListener('click', () => {
    playSound('pop');
});
