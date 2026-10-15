// ---------- Stopwatch State ----------
let startTime = 0; // timestamp when timer started/resumed
let elapsedTime = 0; // accumulated time in ms (across pauses)
let timerInterval = null; // interval handle
let isRunning = false;
let lapCount = 0;
let lastLapTime = 0; // elapsed time at the previous lap

// ---------- DOM References ----------
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const lapBtn = document.getElementById('lapBtn');
const resetBtn = document.getElementById('resetBtn');
const lapsList = document.getElementById('lapsList');
const lapsTitle = document.getElementById('lapsTitle');

// ---------- Time Formatting ----------
function formatTime(ms) {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);

    const pad = (num, len = 2) => String(num).padStart(len, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
}

// ---------- Core Update Loop ----------
function updateDisplay() {
    const currentElapsed = isRunning ? elapsedTime + (Date.now() - startTime) : elapsedTime;
    display.textContent = formatTime(currentElapsed);
}

function tick() {
    updateDisplay();
}

// ---------- Controls ----------
function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startTime = Date.now();
    timerInterval = setInterval(tick, 10);

    startBtn.textContent = 'Resume';
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    lapBtn.disabled = false;
    resetBtn.disabled = false;
}

function pauseTimer() {
    if (!isRunning) return;
    isRunning = false;
    elapsedTime += Date.now() - startTime;
    clearInterval(timerInterval);
    updateDisplay();

    startBtn.disabled = false;
    pauseBtn.disabled = true;
    lapBtn.disabled = true;
}

function resetTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    elapsedTime = 0;
    lastLapTime = 0;
    lapCount = 0;
    display.textContent = formatTime(0);

    startBtn.textContent = 'Start';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    lapBtn.disabled = true;
    resetBtn.disabled = true;

    lapsList.innerHTML = '';
    lapsTitle.classList.add('hidden');
}

function recordLap() {
    if (!isRunning) return;

    const currentElapsed = elapsedTime + (Date.now() - startTime);
    const lapDuration = currentElapsed - lastLapTime;
    lastLapTime = currentElapsed;
    lapCount += 1;

    const li = document.createElement('li');
    li.className = 'lap-item';
    li.innerHTML = `
    <span class="lap-number">Lap ${lapCount}</span>
    <span class="lap-total">${formatTime(currentElapsed)}</span>
    <span class="lap-diff">+${formatTime(lapDuration)}</span>
  `;

    // Insert newest lap at the top
    lapsList.insertBefore(li, lapsList.firstChild);
    lapsTitle.classList.remove('hidden');

    highlightFastestSlowest();
}

// Highlight the fastest and slowest lap based on the "+diff" time
function highlightFastestSlowest() {
    const items = Array.from(lapsList.querySelectorAll('.lap-item'));
    if (items.length < 2) {
        items.forEach(i => i.classList.remove('fastest', 'slowest'));
        return;
    }

    let fastest = null;
    let slowest = null;

    items.forEach(item => {
        const diffText = item.querySelector('.lap-diff').textContent.replace('+', '');
        const parts = diffText.split(/[:.]/).map(Number);
        const ms = (parts[0] * 3600000) + (parts[1] * 60000) + (parts[2] * 1000) + (parts[3] * 10);

        item.classList.remove('fastest', 'slowest');

        if (!fastest || ms < fastest.ms) fastest = {
            item,
            ms
        };
        if (!slowest || ms > slowest.ms) slowest = {
            item,
            ms
        };
    });

    if (fastest) fastest.item.classList.add('fastest');
    if (slowest) slowest.item.classList.add('slowest');
}

// ---------- Event Listeners ----------
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
lapBtn.addEventListener('click', recordLap);
resetBtn.addEventListener('click', resetTimer);

// ---------- Initial Render ----------
display.textContent = formatTime(0);