let currentTask = 0;
const totalTasks = 4;
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
        case 'wrong':
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
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
        showScreen('task1-screen');
        initTask1();
        updateProgress();
    }, 500);
}

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
        showScreen('final-screen');
    }
}

function showVideo() {
    showScreen('video-screen');
    document.getElementById('hamster-video').play();
    updateProgress();
}

// ===== ÚKOL 1: NAKRM KŘEČKA =====
function initTask1() {
    const foodItems = document.querySelectorAll('.food-item');
    const bowl = document.getElementById('bowl');
    let fedCount = 0;
    const requiredFood = 3;
    
    foodItems.forEach(item => {
        let draggedElement = null;
        let startX, startY;
        let originalParent = null;
        
        function handleStart(e) {
            if (item.classList.contains('correct') || item.classList.contains('eaten')) return;
            
            draggedElement = item;
            originalParent = item.parentElement;
            
            const touch = e.touches ? e.touches[0] : e;
            const rect = item.getBoundingClientRect();
            startX = touch.clientX - rect.left;
            startY = touch.clientY - rect.top;
            
            item.classList.add('dragging');
            item.style.position = 'fixed';
            item.style.zIndex = '1000';
            item.style.left = rect.left + 'px';
            item.style.top = rect.top + 'px';
        }
        
        function handleMove(e) {
            if (!draggedElement) return;
            e.preventDefault();
            
            const touch = e.touches ? e.touches[0] : e;
            item.style.left = (touch.clientX - startX) + 'px';
            item.style.top = (touch.clientY - startY) + 'px';
        }
        
        function handleEnd(e) {
            if (!draggedElement) return;
            
            const bowlRect = bowl.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            
            const isOverBowl = !(itemRect.right < bowlRect.left || 
                                itemRect.left > bowlRect.right || 
                                itemRect.bottom < bowlRect.top || 
                                itemRect.top > bowlRect.bottom);
            
            if (isOverBowl) {
                const isCorrectFood = item.dataset.food === 'true';
                
                if (isCorrectFood) {
                    playSound('correct');
                    item.classList.remove('dragging');
                    item.classList.add('correct');
                    
                    setTimeout(() => {
                        item.style.display = 'none';
                        fedCount++;
                        
                        if (fedCount >= requiredFood) {
                            setTimeout(() => {
                                document.querySelector('#task1-screen .next-button').classList.add('show');
                            }, 500);
                        }
                    }, 600);
                } else {
                    playSound('wrong');
                    item.classList.remove('dragging');
                    item.classList.add('wrong');
                    
                    setTimeout(() => {
                        item.classList.remove('wrong');
                        item.style.position = 'relative';
                        item.style.left = '0';
                        item.style.top = '0';
                        item.style.zIndex = '1';
                    }, 500);
                }
            } else {
                item.classList.remove('dragging');
                item.style.position = 'relative';
                item.style.left = '0';
                item.style.top = '0';
                item.style.zIndex = '1';
            }
            
            draggedElement = null;
        }
        
        item.addEventListener('touchstart', handleStart, { passive: false });
        item.addEventListener('touchmove', handleMove, { passive: false });
        item.addEventListener('touchend', handleEnd);
        item.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
    });
}

// ===== ÚKOL 2: NAJDI KŘEČKA =====
function initTask2() {
    const canvas = document.getElementById('scratch-canvas');
    const container = canvas.parentElement;
    
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
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
        checkProgress();
    }
    
    function checkProgress() {
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
        
        if (scratchedPercent > 60) {
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

// ===== ÚKOL 3: PUZZLE (DRAG & DROP) =====
function initTask3() {
    const container = document.getElementById('puzzleContainer');
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width - 20;
    const containerHeight = containerRect.height - 20;
    
    const pieceWidth = containerWidth / 2 - 4;
    const pieceHeight = containerHeight / 3 - 5.33;
    
    const slots = [
        { id: 0, x: 10, y: 10 },
        { id: 1, x: 10 + pieceWidth + 8, y: 10 },
        { id: 2, x: 10, y: 10 + pieceHeight + 8 },
        { id: 3, x: 10 + pieceWidth + 8, y: 10 + pieceHeight + 8 },
        { id: 4, x: 10, y: 10 + 2 * (pieceHeight + 8) },
        { id: 5, x: 10 + pieceWidth + 8, y: 10 + 2 * (pieceHeight + 8) }
    ];
    
    const pieces = [
        { id: 0, startX: 50, startY: 50 },
        { id: 1, startX: containerWidth - pieceWidth - 50, startY: 50 },
        { id: 2, startX: containerWidth / 2 - pieceWidth / 2, startY: containerHeight - pieceHeight - 50 },
        { id: 3, startX: 30, startY: containerHeight / 2 },
        { id: 4, startX: containerWidth - pieceWidth - 30, startY: containerHeight / 2 },
        { id: 5, startX: containerWidth / 2 - pieceWidth / 2, startY: 80 }
    ];
    
    let completedPieces = 0;
    
    slots.forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'puzzle-slot';
        slotDiv.style.left = slot.x + 'px';
        slotDiv.style.top = slot.y + 'px';
        slotDiv.style.width = pieceWidth + 'px';
        slotDiv.style.height = pieceHeight + 'px';
        slotDiv.dataset.slotId = slot.id;
        container.appendChild(slotDiv);
    });
    
    pieces.forEach(piece => {
        const pieceDiv = document.createElement('div');
        pieceDiv.className = 'puzzle-piece';
        pieceDiv.style.left = piece.startX + 'px';
        pieceDiv.style.top = piece.startY + 'px';
        pieceDiv.style.width = pieceWidth + 'px';
        pieceDiv.style.height = pieceHeight + 'px';
        pieceDiv.style.backgroundImage = 'url(hamster-puzzle.png)';
        pieceDiv.dataset.piece = piece.id;
        container.appendChild(pieceDiv);
        
        let isDragging = false;
        let offsetX, offsetY;
        
        function startDrag(e) {
            if (pieceDiv.classList.contains('placed')) return;
            
            isDragging = true;
            const touch = e.touches ? e.touches[0] : e;
            const rect = pieceDiv.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            pieceDiv.classList.add('dragging');
            pieceDiv.style.zIndex = '1000';
        }
        
        function drag(e) {
            if (!isDragging) return;
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const containerRect = container.getBoundingClientRect();
            pieceDiv.style.left = (touch.clientX - containerRect.left - offsetX) + 'px';
            pieceDiv.style.top = (touch.clientY - containerRect.top - offsetY) + 'px';
        }
        
        function endDrag() {
            if (!isDragging) return;
            isDragging = false;
            pieceDiv.classList.remove('dragging');
            
            const correctSlot = slots.find(s => s.id === piece.id);
            const pieceRect = pieceDiv.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            const slotX = correctSlot.x + containerRect.left;
            const slotY = correctSlot.y + containerRect.top;
            
            const distance = Math.sqrt(
                Math.pow(pieceRect.left - slotX, 2) + 
                Math.pow(pieceRect.top - slotY, 2)
            );
            
            if (distance < 80) {
                pieceDiv.style.left = correctSlot.x + 'px';
                pieceDiv.style.top = correctSlot.y + 'px';
                pieceDiv.style.zIndex = '1';
                pieceDiv.classList.add('placed');
                completedPieces++;
                playSound('correct');
                
                if (completedPieces === pieces.length) {
                    setTimeout(() => {
                        playSound('success');
                        document.querySelector('#task3-screen .next-button').classList.add('show');
                    }, 500);
                }
            } else {
                pieceDiv.style.zIndex = '1';
            }
        }
        
        pieceDiv.addEventListener('touchstart', startDrag, { passive: false });
        pieceDiv.addEventListener('touchmove', drag, { passive: false });
        pieceDiv.addEventListener('touchend', endDrag);
        pieceDiv.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
    });
}

// ===== ÚKOL 4: CHYTÁNÍ SEMÍNEK =====
function initTask4() {
    const gameArea = document.getElementById('gameArea');
    const bowl = document.getElementById('bowl4');
    const bowlContainer = document.getElementById('bowlContainer');
    const scoreDisplay = document.getElementById('seedScore');
    
    let score = 0;
    const targetScore = 10;
    let seedInterval;
    let activeSeedsCount = 0;
    const maxActiveSeeds = 3;
    
    let isDragging = false;
    let bowlX = window.innerWidth / 2 - 50;
    
    bowlContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        e.preventDefault();
    }, { passive: false });
    
    bowlContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        bowlX = touch.clientX - 50;
        const maxX = window.innerWidth - 100;
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
        bowlX = e.clientX - 50;
        const maxX = window.innerWidth - 100;
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
