const overlay = document.querySelector("#tool-overlay");
const overlayTitle = document.querySelector("#overlay-title");
const overlayContent = document.querySelector("#overlay-content");
const closeButton = document.querySelector("#close-overlay");
const tilePreview = document.querySelector("#lesson-tile-preview");
const dayValue = document.querySelector("#day-value");
const dateValue = document.querySelector("#date-value");
const seasonValue = document.querySelector("#season-value");
const weatherValue = document.querySelector("#weather-value");
const feelingValue = document.querySelector("#feeling-value");
const feelingTileImage = document.querySelector(".tile-feelings .tile-icon");
const soundToggle = document.querySelector("#sound-toggle");
const fullscreenToggle = document.querySelector("#fullscreen-toggle");
let lastTrigger = null;

const STORAGE_KEY = "inkyPawsLessonTasks";
const TIMER_KEY = "inkyPawsTimer";
const ROUTINE_KEY = "inkyPawsClassroomRoutine";
const LETTER_MODE_KEY = "inkyPawsLetterMode";
const SOUND_KEY = "inkyPawsSoundEnabled";
const WHEEL_CUSTOM_KEY = "inkyPawsWheelCustom";
const WARMUP_CUSTOM_KEY = "inkyPawsWarmupCustom";
const PICTURE_CUSTOM_KEY = "inkyPawsPictureCustom";
const taskNames = ["Warm-up", "Reading", "Listening", "Speaking", "Writing", "Vocabulary", "Grammar", "Presentation", "Game", "Project", "Review", "Quiz", "Homework Check"];
let lesson = loadLesson();
let timer = loadTimer();
let timerInterval = null;
let timerFinished = false;
let diceCount = 1;
let previousLetter = "";
let letterMode = localStorage.getItem(LETTER_MODE_KEY) || "A–Z";
let audioContext = null;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "false";
let routine = loadRoutine();
let wheelMode = "NUMBERS 1–6";
let wheelEditing = false;
let wheelRotation = 0;
let pollMode = "YES / NO";
let pollCounts = {};
let warmupCategory = "ALL";
let warmupHistory = [];
let warmupIndex = -1;
let pictureHistory = [];
let pictureIndex = -1;

function loadRoutine() {
  try {
    return { day: "?", date: "?", season: "?", weather: "?", feeling: "?", ...JSON.parse(sessionStorage.getItem(ROUTINE_KEY)) };
  } catch {
    return { day: "?", date: "?", season: "?", weather: "?", feeling: "?" };
  }
}

function saveRoutine() {
  sessionStorage.setItem(ROUTINE_KEY, JSON.stringify(routine));
  restoreDashboardChoices();
}

function loadTimer() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(TIMER_KEY));
    if (!saved || !Number.isFinite(saved.remaining) || saved.remaining < 0) throw new Error("Invalid timer");
    const remaining = saved.running ? Math.max(0, saved.remaining - Math.floor((Date.now() - saved.savedAt) / 1000)) : saved.remaining;
    return { duration: Math.max(1, saved.duration || remaining || 60), remaining, running: Boolean(saved.running && remaining), endAt: saved.running ? Date.now() + remaining * 1000 : null };
  } catch {
    return { duration: 60, remaining: 60, running: false, endAt: null };
  }
}

function saveTimer() {
  sessionStorage.setItem(TIMER_KEY, JSON.stringify({ duration: timer.duration, remaining: getTimerRemaining(), running: timer.running, savedAt: Date.now() }));
}

function getTimerRemaining() {
  return timer.running ? Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000)) : timer.remaining;
}

function prepareAudio() {
  const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioContext) return null;
  audioContext ||= new AudioContext();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playTone(kind = "bell") {
  if (!soundEnabled) return;
  const context = prepareAudio();
  if (!context) return;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = kind === "buzzer" ? "square" : "sine";
  oscillator.frequency.setValueAtTime(kind === "buzzer" ? 220 : 740, context.currentTime);
  if (kind === "bell") oscillator.frequency.exponentialRampToValueAtTime(1040, context.currentTime + .18);
  gain.gain.setValueAtTime(.16, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + (kind === "buzzer" ? .22 : .55));
  oscillator.connect(gain).connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + (kind === "buzzer" ? .22 : .55));
}

function newTask(name, completed = false) {
  const id = globalThis.crypto?.randomUUID?.() || `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id, name, completed };
}

function loadLesson() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved?.tasks)) {
      const tasks = saved.tasks
        .filter((task) => task && typeof task.id === "string" && taskNames.includes(task.name))
        .map((task) => ({ id: task.id, name: task.name, completed: Boolean(task.completed) }));
      return { tasks, started: Boolean(saved.started && tasks.length), rewardShown: Boolean(saved.rewardShown) };
    }
    // Migrate the previous name-based Lesson Tasks state without losing work.
    if (Array.isArray(saved?.selected)) {
      const completed = Array.isArray(saved.completed) ? saved.completed : [];
      const tasks = saved.selected.filter((name) => taskNames.includes(name)).map((name) => newTask(name, completed.includes(name)));
      return { tasks, started: Boolean(saved.active && tasks.length), rewardShown: Boolean(saved.rewardShown) };
    }
    throw new Error("Invalid state");
  } catch {
    return { tasks: [], started: false, rewardShown: false };
  }
}

function saveLesson() {
  if (!lesson.tasks.length) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(lesson));
  updateTilePreview();
}

function updateTilePreview() {
  tilePreview.hidden = !lesson.started;
  if (!lesson.started) {
    tilePreview.replaceChildren();
    return;
  }
  const visibleLimit = 6;
  const fragment = document.createDocumentFragment();
  lesson.tasks.slice(0, visibleLimit).forEach((task) => {
    const row = document.createElement("span");
    row.className = task.completed ? "tile-preview-task completed" : "tile-preview-task";
    row.textContent = `${task.completed ? "✓" : "☐"} ${task.name}`;
    fragment.append(row);
  });
  if (lesson.tasks.length > visibleLimit) {
    const more = document.createElement("strong");
    more.className = "tile-preview-more";
    more.textContent = `+${lesson.tasks.length - visibleLimit} more`;
    fragment.append(more);
  }
  tilePreview.replaceChildren(fragment);
}

function openTool(toolName, trigger) {
  lastTrigger = trigger;
  overlayTitle.textContent = toolName;
  overlay.hidden = false;
  document.body.classList.add("overlay-open");
  if (toolName === "Lesson Tasks") renderLessonTasks();
  else if (toolName === "Timer") renderTimer();
  else if (toolName === "Dice") renderDice();
  else if (toolName === "Random Letter") renderRandomLetter();
  else if (toolName === "Buzzer") renderBuzzer();
  else if (toolName === "Weather") renderWeather();
  else if (toolName === "Feelings") renderFeelings();
  else if (toolName === "Day") renderRoutineChoice("day", ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
  else if (toolName === "Date") renderMonthChoice();
  else if (toolName === "Season") renderRoutineChoice("season", ["Spring", "Summer", "Fall", "Winter"]);
  else if (toolName === "Wheel") renderWheel();
  else if (toolName === "Quick Poll") renderQuickPoll();
  else if (toolName === "Warm-up Question") renderWarmup();
  else if (toolName === "Picture Prompt") renderPicturePrompt();
  else overlayContent.innerHTML = "<p>Tool coming next</p>";
  (overlayContent.querySelector("button") || closeButton).focus();
}

function closeTool() {
  overlay.hidden = true;
  document.body.classList.remove("overlay-open");
  lastTrigger?.focus();
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function updateTimerDisplay() {
  const display = document.querySelector("#timer-display");
  timer.remaining = getTimerRemaining();
  if (timer.running && timer.remaining === 0) {
    finishTimer();
    return;
  }
  if (!display) return;
  display.textContent = formatTime(timer.remaining);
  document.querySelector("#timer-start").textContent = timer.running ? "RUNNING" : "START";
  document.querySelector("#timer-start").disabled = timer.running || timer.remaining === 0;
  document.querySelector("#timer-pause").disabled = !timer.running;
}

function runTimerClock() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const remaining = getTimerRemaining();
    if (remaining !== timer.remaining) {
      timer.remaining = remaining;
      saveTimer();
    }
    if (timer.running && remaining === 0) finishTimer();
    else updateTimerDisplay();
    if (!timer.running) clearInterval(timerInterval);
  }, 250);
}

function finishTimer() {
  if (!timer.running) return;
  timer.running = false;
  timer.remaining = 0;
  saveTimer();
  clearInterval(timerInterval);
  playTone("bell");
  const alert = document.querySelector("#timer-alert");
  if (alert && !timerFinished) {
    timerFinished = true;
    alert.hidden = false;
    alert.classList.add("timer-celebrate");
    setTimeout(() => { if (alert) alert.hidden = true; }, 1800);
  }
  updateTimerDisplay();
}

function setTimer(seconds) {
  timer = { duration: seconds, remaining: seconds, running: false, endAt: null };
  timerFinished = false;
  saveTimer();
  renderTimer();
}

function renderTimer() {
  timer.remaining = getTimerRemaining();
  overlayContent.innerHTML = `<div class="game-tool timer-tool">
    <div class="timer-presets" aria-label="Timer presets">${[1, 3, 5, 10, 15].map((minutes) => `<button type="button" data-timer-preset="${minutes * 60}">${minutes} MIN</button>`).join("")}<button type="button" id="custom-time">CUSTOM TIME</button></div>
    <div class="timer-display" id="timer-display" role="timer">${formatTime(timer.remaining)}</div>
    <div class="timer-alert" id="timer-alert" hidden><span aria-hidden="true">✦</span> TIME'S UP! <span aria-hidden="true">✦</span></div>
    <div class="tool-actions"><button type="button" class="action-primary" id="timer-start">START</button><button type="button" id="timer-pause">PAUSE</button><button type="button" id="timer-reset">RESET</button></div>
  </div>`;
  overlayContent.querySelectorAll("[data-timer-preset]").forEach((button) => button.addEventListener("click", () => setTimer(Number(button.dataset.timerPreset))));
  document.querySelector("#custom-time").addEventListener("click", renderCustomTimer);
  document.querySelector("#timer-start").addEventListener("click", () => {
    if (!timer.remaining) return;
    prepareAudio();
    timer.running = true;
    timer.endAt = Date.now() + timer.remaining * 1000;
    timerFinished = false;
    saveTimer();
    updateTimerDisplay();
    runTimerClock();
  });
  document.querySelector("#timer-pause").addEventListener("click", () => {
    timer.remaining = getTimerRemaining();
    timer.running = false;
    timer.endAt = null;
    saveTimer();
    updateTimerDisplay();
  });
  document.querySelector("#timer-reset").addEventListener("click", () => setTimer(timer.duration));
  updateTimerDisplay();
  if (timer.running) runTimerClock();
}

function renderCustomTimer() {
  let minutes = Math.floor(timer.remaining / 60);
  let seconds = timer.remaining % 60;
  overlayContent.innerHTML = `<div class="game-tool custom-timer"><p>SET CUSTOM TIME</p><div class="time-pickers">
    <div><button type="button" data-adjust-minutes="1" aria-label="Add one minute">＋</button><strong id="custom-minutes">${minutes}</strong><span>MINUTES</span><button type="button" data-adjust-minutes="-1" aria-label="Subtract one minute">−</button></div>
    <b>:</b>
    <div><button type="button" data-adjust-seconds="5" aria-label="Add five seconds">＋</button><strong id="custom-seconds">${seconds.toString().padStart(2, "0")}</strong><span>SECONDS</span><button type="button" data-adjust-seconds="-5" aria-label="Subtract five seconds">−</button></div>
  </div><div class="tool-actions"><button type="button" class="action-primary" id="set-custom-time">SET TIME</button><button type="button" id="cancel-custom-time">CANCEL</button></div></div>`;
  const refresh = () => { document.querySelector("#custom-minutes").textContent = minutes; document.querySelector("#custom-seconds").textContent = seconds.toString().padStart(2, "0"); };
  overlayContent.querySelectorAll("[data-adjust-minutes]").forEach((button) => button.addEventListener("click", () => { minutes = Math.max(0, Math.min(99, minutes + Number(button.dataset.adjustMinutes))); refresh(); }));
  overlayContent.querySelectorAll("[data-adjust-seconds]").forEach((button) => button.addEventListener("click", () => { seconds = (seconds + Number(button.dataset.adjustSeconds) + 60) % 60; refresh(); }));
  document.querySelector("#set-custom-time").addEventListener("click", () => setTimer(Math.max(1, minutes * 60 + seconds)));
  document.querySelector("#cancel-custom-time").addEventListener("click", renderTimer);
}

function renderDice() {
  overlayContent.innerHTML = `<div class="game-tool dice-tool"><div class="mode-buttons"><button type="button" data-dice-mode="1" aria-pressed="${diceCount === 1}">1 DIE</button><button type="button" data-dice-mode="2" aria-pressed="${diceCount === 2}">2 DICE</button></div><div class="dice-stage" id="dice-stage"><div class="die">?</div></div><div class="dice-total" id="dice-total">TAP ROLL</div><button type="button" class="action-primary roll-button" id="roll-dice">ROLL</button></div>`;
  overlayContent.querySelectorAll("[data-dice-mode]").forEach((button) => button.addEventListener("click", () => { diceCount = Number(button.dataset.diceMode); renderDice(); }));
  document.querySelector("#roll-dice").addEventListener("click", rollDice);
}

function rollDice() {
  const button = document.querySelector("#roll-dice");
  const stage = document.querySelector("#dice-stage");
  button.disabled = true;
  stage.classList.add("rolling");
  stage.innerHTML = Array.from({ length: diceCount }, () => `<div class="die">${Math.ceil(Math.random() * 6)}</div>`).join("");
  setTimeout(() => {
    const results = Array.from({ length: diceCount }, () => Math.ceil(Math.random() * 6));
    stage.innerHTML = results.map((result) => `<div class="die">${result}</div>`).join("");
    stage.classList.remove("rolling");
    document.querySelector("#dice-total").textContent = diceCount === 2 ? `${results[0]} + ${results[1]} = ${results[0] + results[1]}` : `YOU ROLLED ${results[0]}`;
    button.disabled = false;
  }, 520);
}

function letterPool() {
  if (letterMode === "VOWELS") return "AEIOU";
  if (letterMode === "CONSONANTS") return "BCDFGHJKLMNPQRSTVWXYZ";
  return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
}

function newLetter() {
  const pool = letterPool();
  let next;
  do next = pool[Math.floor(Math.random() * pool.length)]; while (next === previousLetter && pool.length > 1);
  previousLetter = next;
  const display = document.querySelector("#letter-display");
  display.textContent = next;
  display.classList.remove("letter-pop");
  void display.offsetWidth;
  display.classList.add("letter-pop");
}

function renderRandomLetter() {
  if (!["A–Z", "VOWELS", "CONSONANTS"].includes(letterMode)) letterMode = "A–Z";
  overlayContent.innerHTML = `<div class="game-tool letter-tool"><div class="mode-buttons">${["A–Z", "VOWELS", "CONSONANTS"].map((mode) => `<button type="button" data-letter-mode="${mode}" aria-pressed="${letterMode === mode}">${mode}</button>`).join("")}</div><div class="letter-display" id="letter-display">${previousLetter || "A"}</div><button type="button" class="action-primary" id="new-letter">NEW LETTER</button></div>`;
  overlayContent.querySelectorAll("[data-letter-mode]").forEach((button) => button.addEventListener("click", () => { letterMode = button.dataset.letterMode; previousLetter = ""; localStorage.setItem(LETTER_MODE_KEY, letterMode); renderRandomLetter(); newLetter(); }));
  document.querySelector("#new-letter").addEventListener("click", newLetter);
}

function renderBuzzer() {
  overlayContent.innerHTML = `<div class="game-tool buzzer-tool"><button type="button" class="big-buzzer" id="big-buzzer"><span aria-hidden="true">🍄</span><strong>BUZZ!</strong></button><p>TAP THE MUSHROOM</p></div>`;
  document.querySelector("#big-buzzer").addEventListener("click", (event) => {
    playTone("buzzer");
    event.currentTarget.classList.remove("buzz-pulse");
    void event.currentTarget.offsetWidth;
    event.currentTarget.classList.add("buzz-pulse");
  });
}

const weatherOptions = [["SUNNY", "☀️"], ["CLOUDY", "☁️"], ["RAINY", "🌧️"], ["WINDY", "💨"], ["SNOWY", "❄️"], ["STORMY", "⛈️"], ["FOGGY", "🌫️"]];
const feelingOptions = ["ANGRY", "EMBARRASSED", "EXCITED", "FRUSTRATED", "HAPPY", "PROUD", "SAD", "SCARED"]
  .map((name) => ({ name, src: `feelings/images/${name.toLowerCase()}.jpg` }));

function renderChoiceGrid(options, type) {
  overlayContent.innerHTML = `<div class="choice-grid ${type}-choices">${options.map(([name, icon]) => `<button type="button" data-choice="${name}"><span aria-hidden="true">${icon}</span><strong>${name}</strong></button>`).join("")}</div>`;
  overlayContent.querySelectorAll("[data-choice]").forEach((button) => button.addEventListener("click", () => {
    if (type === "weather") {
      routine.weather = button.dataset.choice[0] + button.dataset.choice.slice(1).toLowerCase();
    } else {
      routine.feeling = button.dataset.choice[0] + button.dataset.choice.slice(1).toLowerCase();
    }
    saveRoutine();
    closeTool();
  }));
}

function renderWeather() { renderChoiceGrid(weatherOptions, "weather"); }
function renderFeelings() {
  const selected = routine.feeling.toUpperCase();
  overlayContent.innerHTML = `<div class="feeling-grid">${feelingOptions.map((feeling) => `<button type="button" data-feeling="${feeling.name}" aria-pressed="${selected === feeling.name}"><span class="feeling-image"><img src="${feeling.src}" alt="${feeling.name.toLowerCase()} character" /><span class="feeling-image-placeholder" hidden>IMAGE UNAVAILABLE</span></span><strong>${feeling.name}</strong></button>`).join("")}</div>`;
  overlayContent.querySelectorAll(".feeling-image img").forEach((image) => {
    const showImage = () => image.classList.add("loaded");
    const showPlaceholder = () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    };
    image.addEventListener("load", showImage);
    image.addEventListener("error", showPlaceholder);
    if (image.complete) {
      if (image.naturalWidth) showImage(); else showPlaceholder();
    }
  });
  overlayContent.querySelectorAll("[data-feeling]").forEach((button) => button.addEventListener("click", () => {
    routine.feeling = button.dataset.feeling[0] + button.dataset.feeling.slice(1).toLowerCase();
    saveRoutine();
    closeTool();
  }));
}

function restoreDashboardChoices() {
  dayValue.textContent = routine.day;
  dateValue.textContent = routine.date;
  seasonValue.textContent = routine.season;
  weatherValue.textContent = routine.weather;
  const selectedFeeling = feelingOptions.find((feeling) => feeling.name === routine.feeling.toUpperCase());
  feelingValue.textContent = selectedFeeling?.name || "";
  feelingValue.hidden = !selectedFeeling;
  feelingTileImage.classList.toggle("selected-feeling-image", Boolean(selectedFeeling));
  feelingTileImage.src = selectedFeeling?.src || "assets/images/feelings.png";
  feelingTileImage.alt = selectedFeeling ? `${selectedFeeling.name.toLowerCase()} character` : "";
  feelingTileImage.setAttribute("aria-hidden", String(!selectedFeeling));
  feelingTileImage.onerror = selectedFeeling ? () => {
    feelingTileImage.onerror = null;
    feelingTileImage.src = "assets/images/feelings.png";
    feelingTileImage.alt = "Feeling image unavailable";
    feelingTileImage.setAttribute("aria-hidden", "false");
  } : null;
}

function renderRoutineChoice(field, options) {
  overlayContent.innerHTML = `<div class="routine-grid">${options.map((option) => `<button type="button" data-routine-choice="${option}">${option.toUpperCase()}</button>`).join("")}</div>`;
  overlayContent.querySelectorAll("[data-routine-choice]").forEach((button) => button.addEventListener("click", () => {
    routine[field] = button.dataset.routineChoice;
    saveRoutine();
    closeTool();
  }));
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function renderMonthChoice() {
  overlayContent.innerHTML = `<div class="selection-page"><h3>SELECT A MONTH</h3><div class="month-grid">${months.map((month) => `<button type="button" data-month="${month}">${month.toUpperCase()}</button>`).join("")}</div></div>`;
  overlayContent.querySelectorAll("[data-month]").forEach((button) => button.addEventListener("click", () => renderDateNumber(button.dataset.month)));
}

function renderDateNumber(month) {
  overlayContent.innerHTML = `<div class="selection-page"><h3>${month.toUpperCase()}</h3><div class="number-grid">${Array.from({ length: 31 }, (_, index) => `<button type="button" data-date-number="${index + 1}">${index + 1}</button>`).join("")}</div></div>`;
  overlayContent.querySelectorAll("[data-date-number]").forEach((button) => button.addEventListener("click", () => {
    routine.date = `${month.toUpperCase()} ${button.dataset.dateNumber}`;
    saveRoutine();
    closeTool();
  }));
}

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

const wheelModes = {
  "NUMBERS 1–6": ["1", "2", "3", "4", "5", "6"],
  "NUMBERS 1–10": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  COLORS: ["Red", "Orange", "Yellow", "Green", "Blue", "Purple"],
  TASKS: ["Speak", "Draw", "Mime", "Describe", "Explain", "Ask"],
  SKILLS: ["Reading", "Listening", "Speaking", "Writing", "Vocabulary", "Grammar"]
};

function getWheelEntries() {
  if (wheelMode === "CUSTOM") return readStoredArray(WHEEL_CUSTOM_KEY).filter((entry) => typeof entry === "string" && entry.trim()).slice(0, 12);
  return wheelModes[wheelMode];
}

function renderWheel() {
  const entries = getWheelEntries();
  const colors = ["#e5ad3d", "#66875b", "#d97757", "#6d9a88", "#f1cf70", "#8b78a1", "#9dbb78", "#4f7d62", "#dda761", "#7197a0", "#b6ca94", "#cc805f"];
  const gradient = entries?.length ? `conic-gradient(${entries.map((_, index) => `${colors[index % colors.length]} ${(index / entries.length) * 100}% ${((index + 1) / entries.length) * 100}%`).join(",")})` : "var(--pale-sage)";
  overlayContent.innerHTML = `<div class="wheel-tool game-tool">
    <div class="wheel-modes">${[...Object.keys(wheelModes), "CUSTOM"].map((mode) => `<button type="button" data-wheel-mode="${mode}" aria-pressed="${wheelMode === mode}">${mode}</button>`).join("")}</div>
    ${wheelMode === "CUSTOM" && (!entries.length || wheelEditing) ? `<div class="custom-wheel-editor"><label for="wheel-custom-input">CUSTOM SECTIONS — ONE PER LINE</label><textarea id="wheel-custom-input" rows="5" placeholder="Add 2–12 sections">${escapeHTML((entries || []).join("\n"))}</textarea><button type="button" class="action-primary" id="save-wheel-custom">SAVE SECTIONS</button></div>` : `<div class="wheel-stage"><span class="wheel-pointer" aria-hidden="true">▼</span><div class="wheel-disc" id="wheel-disc" style="background:${gradient};transform:rotate(${wheelRotation}deg)">${(entries || []).map((entry, index) => `<span style="--item:${index};--count:${entries.length}">${escapeHTML(entry)}</span>`).join("")}</div></div><div class="wheel-result" id="wheel-result">${entries?.length ? "READY TO SPIN" : "ADD CUSTOM SECTIONS"}</div><button type="button" class="action-primary spin-button" id="spin-wheel" ${entries?.length ? "" : "disabled"}>SPIN</button>${wheelMode === "CUSTOM" ? `<button type="button" id="edit-wheel-custom">EDIT SECTIONS</button>` : ""}`}
  </div>`;
  overlayContent.querySelectorAll("[data-wheel-mode]").forEach((button) => button.addEventListener("click", () => { wheelMode = button.dataset.wheelMode; wheelEditing = false; wheelRotation = 0; renderWheel(); }));
  document.querySelector("#save-wheel-custom")?.addEventListener("click", () => {
    const values = document.querySelector("#wheel-custom-input").value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean).slice(0, 12);
    if (values.length < 2) return;
    localStorage.setItem(WHEEL_CUSTOM_KEY, JSON.stringify(values));
    wheelEditing = false;
    renderWheel();
  });
  document.querySelector("#edit-wheel-custom")?.addEventListener("click", () => {
    wheelEditing = true;
    renderWheel();
  });
  document.querySelector("#spin-wheel")?.addEventListener("click", spinWheel);
}

function spinWheel() {
  const entries = getWheelEntries();
  const selectedIndex = Math.floor(Math.random() * entries.length);
  const disc = document.querySelector("#wheel-disc");
  const button = document.querySelector("#spin-wheel");
  button.disabled = true;
  playTone("spin");
  const segment = 360 / entries.length;
  const currentAngle = ((wheelRotation % 360) + 360) % 360;
  const targetAngle = (360 - selectedIndex * segment - segment / 2 + 360) % 360;
  wheelRotation += 1080 + ((targetAngle - currentAngle + 360) % 360);
  disc.style.transform = `rotate(${wheelRotation}deg)`;
  setTimeout(() => {
    document.querySelector("#wheel-result").textContent = entries[selectedIndex].toUpperCase();
    button.disabled = false;
    playTone("bell");
  }, 1250);
}

const pollModes = {
  "YES / NO": ["YES", "NO"],
  "TRUE / FALSE": ["TRUE", "FALSE"],
  "A / B": ["A", "B"],
  "A / B / C / D": ["A", "B", "C", "D"],
  "THUMBS UP / THUMBS DOWN": ["👍 THUMBS UP", "👎 THUMBS DOWN"]
};

function resetPollCounts() {
  pollCounts = Object.fromEntries(pollModes[pollMode].map((option) => [option, 0]));
}

function renderQuickPoll(reset = false) {
  if (reset || Object.keys(pollCounts).some((key) => !pollModes[pollMode].includes(key)) || !Object.keys(pollCounts).length) resetPollCounts();
  overlayContent.innerHTML = `<div class="poll-tool game-tool"><div class="poll-modes">${Object.keys(pollModes).map((mode) => `<button type="button" data-poll-mode="${mode}" aria-pressed="${pollMode === mode}">${mode}</button>`).join("")}</div><div class="poll-options">${pollModes[pollMode].map((option) => `<button type="button" data-poll-option="${escapeHTML(option)}"><strong>${escapeHTML(option)}</strong><span>${pollCounts[option]}</span></button>`).join("")}</div><button type="button" id="reset-poll">RESET POLL</button></div>`;
  overlayContent.querySelectorAll("[data-poll-mode]").forEach((button) => button.addEventListener("click", () => { pollMode = button.dataset.pollMode; resetPollCounts(); renderQuickPoll(); }));
  overlayContent.querySelectorAll("[data-poll-option]").forEach((button) => button.addEventListener("click", () => { pollCounts[button.dataset.pollOption] += 1; renderQuickPoll(); }));
  document.querySelector("#reset-poll").addEventListener("click", () => renderQuickPoll(true));
}

const warmupCategories = ["ALL", "SPRING", "SUMMER", "FALL", "WINTER", "PERSONAL", "PAST SIMPLE"];
const customWarmupCategories = warmupCategories.slice(1);

function allWarmupQuestions() {
  const builtIn = Array.isArray(globalThis.INKY_PAWS_WARMUP_QUESTIONS) ? globalThis.INKY_PAWS_WARMUP_QUESTIONS : [];
  const custom = readStoredArray(WARMUP_CUSTOM_KEY).map((question) => {
    const legacyTheme = String(question.theme || "").toUpperCase();
    const category = customWarmupCategories.includes(question.category) ? question.category : (customWarmupCategories.includes(legacyTheme) ? legacyTheme : "PERSONAL");
    return { ...question, category, custom: true };
  });
  return [...builtIn.map((question) => ({ ...question, custom: false })), ...custom];
}

function eligibleWarmups() {
  return allWarmupQuestions().filter((question) => warmupCategory === "ALL" || question.category === warmupCategory);
}

function currentWarmup() { return warmupHistory[warmupIndex] || null; }

function renderWarmup() {
  const question = currentWarmup();
  overlayContent.innerHTML = `<div class="content-tool warmup-tool"><div class="warmup-categories" aria-label="Question category">${warmupCategories.map((category) => `<button type="button" data-warmup-category="${category}" aria-pressed="${warmupCategory === category}">${category}</button>`).join("")}</div><div class="question-card" id="question-card">${question ? escapeHTML(question.question) : "CHOOSE A CATEGORY AND PRESS RANDOM QUESTION"}</div><div class="classroom-controls"><button type="button" class="action-primary" id="random-question">RANDOM QUESTION</button><button type="button" id="previous-question" ${warmupIndex <= 0 ? "disabled" : ""}>PREVIOUS</button><button type="button" id="next-question">NEXT</button></div><div class="management-controls"><button type="button" id="add-question">ADD QUESTION</button><button type="button" id="edit-question" ${question?.custom ? "" : "disabled"}>EDIT</button><button type="button" id="delete-question" ${question?.custom ? "" : "disabled"}>DELETE</button></div></div>`;
  overlayContent.querySelectorAll("[data-warmup-category]").forEach((button) => button.addEventListener("click", () => { warmupCategory = button.dataset.warmupCategory; warmupHistory = []; warmupIndex = -1; renderWarmup(); }));
  document.querySelector("#random-question").addEventListener("click", randomWarmup);
  document.querySelector("#previous-question").addEventListener("click", () => { warmupIndex -= 1; renderWarmup(); });
  document.querySelector("#next-question").addEventListener("click", () => { if (warmupIndex < warmupHistory.length - 1) { warmupIndex += 1; renderWarmup(); } else randomWarmup(); });
  document.querySelector("#add-question").addEventListener("click", () => renderWarmupEditor());
  document.querySelector("#edit-question").addEventListener("click", () => renderWarmupEditor(question));
  document.querySelector("#delete-question").addEventListener("click", deleteWarmup);
}

function randomWarmup() {
  const eligible = eligibleWarmups();
  if (!eligible.length) { warmupHistory = []; warmupIndex = -1; renderWarmup(); return; }
  const previousId = currentWarmup()?.id;
  const pool = eligible.length > 1 ? eligible.filter((question) => question.id !== previousId) : eligible;
  const question = pool[Math.floor(Math.random() * pool.length)];
  warmupHistory = warmupHistory.slice(0, warmupIndex + 1);
  warmupHistory.push(question);
  warmupIndex += 1;
  renderWarmup();
}

function renderWarmupEditor(question = null) {
  overlayContent.innerHTML = `<form class="content-editor" id="warmup-editor"><h3>${question ? "EDIT QUESTION" : "ADD QUESTION"}</h3><label>QUESTION<textarea id="question-text" required>${question ? escapeHTML(question.question) : ""}</textarea></label><div class="editor-selects warmup-editor-selects"><label>CATEGORY<select id="question-category">${customWarmupCategories.map((value) => `<option ${question?.category === value ? "selected" : ""}>${value}</option>`).join("")}</select></label></div><div class="classroom-controls"><button type="submit" class="action-primary">SAVE QUESTION</button><button type="button" id="cancel-question">CANCEL</button></div></form>`;
  document.querySelector("#warmup-editor").addEventListener("submit", (event) => {
    event.preventDefault();
    const custom = readStoredArray(WARMUP_CUSTOM_KEY);
    const item = { id: question?.id || `custom-question-${Date.now()}`, question: document.querySelector("#question-text").value.trim(), category: document.querySelector("#question-category").value };
    if (!item.question) return;
    const index = custom.findIndex((entry) => entry.id === item.id);
    if (index >= 0) custom[index] = item; else custom.push(item);
    localStorage.setItem(WARMUP_CUSTOM_KEY, JSON.stringify(custom));
    warmupCategory = item.category;
    warmupHistory = [{ ...item, custom: true }]; warmupIndex = 0;
    renderWarmup();
  });
  document.querySelector("#cancel-question").addEventListener("click", renderWarmup);
}

function deleteWarmup() {
  const question = currentWarmup();
  if (!question?.custom || !globalThis.confirm("Delete this custom question?")) return;
  localStorage.setItem(WARMUP_CUSTOM_KEY, JSON.stringify(readStoredArray(WARMUP_CUSTOM_KEY).filter((entry) => entry.id !== question.id)));
  warmupHistory.splice(warmupIndex, 1);
  warmupIndex = Math.min(warmupIndex, warmupHistory.length - 1);
  renderWarmup();
}

function allPictures() {
  const builtIn = Array.isArray(globalThis.INKY_PAWS_PICTURE_PROMPTS) ? globalThis.INKY_PAWS_PICTURE_PROMPTS : [];
  const normalize = (picture, custom, index) => {
    const file = String(picture.file || picture.src || "").trim();
    if (!file) return null;
    const isPath = /^(?:[a-z]+:|\/|\.\.\/|\.\/)/i.test(file);
    return {
      id: picture.id || `${custom ? "custom" : "built-in"}-picture-${index}-${file}`,
      file,
      src: isPath ? file : `picture-prompts/images/${file}`,
      feelingsQuestion: picture.feelingsQuestion === true,
      custom
    };
  };
  return [
    ...builtIn.map((picture, index) => normalize(picture, false, index)),
    ...readStoredArray(PICTURE_CUSTOM_KEY).map((picture, index) => normalize(picture, true, index))
  ].filter(Boolean);
}
function currentPicture() { return pictureHistory[pictureIndex] || null; }

function renderPicturePrompt() {
  const library = allPictures();
  if (!currentPicture() && library.length) {
    pictureHistory = [library[0]];
    pictureIndex = 0;
  }
  const picture = currentPicture();
  const questions = [
    "What can you see?",
    "What is happening?",
    "What do you think happened before?",
    "What do you think will happen next?",
    ...(picture?.feelingsQuestion ? ["How do you think they feel? Why?"] : [])
  ];
  overlayContent.innerHTML = `<div class="content-tool picture-tool"><div class="picture-stage">${picture ? `<img src="${escapeHTML(picture.src)}" alt="Picture prompt" id="prompt-image" />` : `<div class="picture-empty">PICTURE PROMPTS COMING SOON</div>`}</div><div class="picture-questions" aria-label="Discussion questions">${questions.map((question) => `<p>${escapeHTML(question)}</p>`).join("")}</div><div class="classroom-controls picture-controls"><button type="button" class="action-primary" id="random-picture" ${library.length ? "" : "disabled"}>RANDOM PICTURE</button><button type="button" id="previous-picture" ${pictureIndex <= 0 ? "disabled" : ""}>PREVIOUS</button><button type="button" id="next-picture" ${library.length ? "" : "disabled"}>NEXT</button><button type="button" id="back-picture">BACK</button></div><div class="management-controls"><button type="button" id="add-picture">ADD PICTURE</button><button type="button" id="delete-picture" ${picture?.custom ? "" : "disabled"}>REMOVE PICTURE</button></div></div>`;
  const promptImage = document.querySelector("#prompt-image");
  const showUnavailablePicture = () => {
    const stage = promptImage?.parentElement;
    promptImage?.remove();
    stage?.insertAdjacentHTML("afterbegin", `<div class="picture-empty">PICTURE UNAVAILABLE</div>`);
  };
  promptImage?.addEventListener("load", () => promptImage.classList.add("loaded"));
  promptImage?.addEventListener("error", showUnavailablePicture);
  if (promptImage?.complete) {
    if (promptImage.naturalWidth) promptImage.classList.add("loaded");
    else showUnavailablePicture();
  }
  document.querySelector("#random-picture").addEventListener("click", randomPicture);
  document.querySelector("#previous-picture").addEventListener("click", () => { pictureIndex -= 1; renderPicturePrompt(); });
  document.querySelector("#next-picture").addEventListener("click", nextPicture);
  document.querySelector("#back-picture").addEventListener("click", closeTool);
  document.querySelector("#add-picture").addEventListener("click", () => renderPictureEditor());
  document.querySelector("#delete-picture").addEventListener("click", deletePicture);
}

function randomPicture() {
  const library = allPictures();
  if (!library.length) { pictureHistory = []; pictureIndex = -1; renderPicturePrompt(); return; }
  const previousId = currentPicture()?.id;
  const pool = library.length > 1 ? library.filter((picture) => picture.id !== previousId) : library;
  pictureHistory = pictureHistory.slice(0, pictureIndex + 1);
  pictureHistory.push(pool[Math.floor(Math.random() * pool.length)]);
  pictureIndex += 1;
  renderPicturePrompt();
}

function nextPicture() {
  const library = allPictures();
  if (!library.length) return;
  const currentLibraryIndex = library.findIndex((picture) => picture.id === currentPicture()?.id);
  const next = library[(currentLibraryIndex + 1 + library.length) % library.length];
  pictureHistory = pictureHistory.slice(0, pictureIndex + 1);
  pictureHistory.push(next);
  pictureIndex += 1;
  renderPicturePrompt();
}

function renderPictureEditor() {
  overlayContent.innerHTML = `<form class="content-editor" id="picture-editor"><h3>ADD PICTURE</h3><label>IMAGE FILE NAME<input id="picture-file" required placeholder="picture-001.jpg" /></label><label class="picture-feelings-option"><input type="checkbox" id="picture-feelings" /> SHOW “HOW DO YOU THINK THEY FEEL? WHY?”</label><p>Place the image in <strong>teacher-tools/picture-prompts/images/</strong>, then enter its exact file name here.</p><div class="classroom-controls"><button type="submit" class="action-primary">SAVE PICTURE</button><button type="button" id="cancel-picture">CANCEL</button></div></form>`;
  document.querySelector("#picture-editor").addEventListener("submit", (event) => {
    event.preventDefault();
    const custom = readStoredArray(PICTURE_CUSTOM_KEY);
    const item = { id: `custom-picture-${Date.now()}`, file: document.querySelector("#picture-file").value.trim(), feelingsQuestion: document.querySelector("#picture-feelings").checked };
    if (!item.file) return;
    custom.push(item);
    localStorage.setItem(PICTURE_CUSTOM_KEY, JSON.stringify(custom));
    const saved = allPictures().find((picture) => picture.id === item.id);
    pictureHistory = saved ? [saved] : [];
    pictureIndex = saved ? 0 : -1;
    renderPicturePrompt();
  });
  document.querySelector("#cancel-picture").addEventListener("click", renderPicturePrompt);
}

function deletePicture() {
  const picture = currentPicture();
  if (!picture?.custom || !globalThis.confirm("Remove this custom picture?")) return;
  localStorage.setItem(PICTURE_CUSTOM_KEY, JSON.stringify(readStoredArray(PICTURE_CUSTOM_KEY).filter((entry) => entry.id !== picture.id)));
  pictureHistory = pictureHistory.filter((entry) => entry.id !== picture.id);
  pictureIndex = Math.min(pictureIndex, pictureHistory.length - 1);
  renderPicturePrompt();
}

function renderLessonTasks() {
  if (lesson.started) renderActiveLesson();
  else renderSetup();
}

function renderSetup(focusId) {
  overlayContent.innerHTML = `
    <div class="lesson-screen lesson-setup">
      <section class="stage-picker" aria-labelledby="choose-stages-title">
        <h3 id="choose-stages-title">Choose Lesson Stages</h3>
        <div class="task-options">${taskNames.map((name) => `<button type="button" class="task-option" data-add-task="${name}"><span aria-hidden="true">+</span> ${name}</button>`).join("")}</div>
      </section>
      <section class="lesson-builder" aria-labelledby="your-lesson-title">
        <h3 id="your-lesson-title">Your Lesson</h3>
        <ol class="setup-task-list">${lesson.tasks.length ? lesson.tasks.map((task, index) => `
          <li class="setup-task" data-setup-id="${task.id}">
            <span class="setup-task-number">${index + 1}.</span><strong>${task.name}</strong>
            <span class="order-controls">
              <button type="button" data-move-up="${task.id}" ${index === 0 ? "disabled" : ""} aria-label="Move ${task.name} up">&#8593; <span>Move up</span></button>
              <button type="button" data-move-down="${task.id}" ${index === lesson.tasks.length - 1 ? "disabled" : ""} aria-label="Move ${task.name} down">&#8595; <span>Move down</span></button>
              <button type="button" class="remove-task" data-remove-task="${task.id}" aria-label="Remove ${task.name}">&#10005; <span>Remove</span></button>
            </span>
          </li>`).join("") : `<li class="empty-lesson">Tap a stage above to build your lesson.</li>`}</ol>
        <button type="button" class="lesson-primary" id="start-lesson" ${lesson.tasks.length ? "" : "disabled"}>START LESSON</button>
      </section>
    </div>`;

  overlayContent.querySelectorAll("[data-add-task]").forEach((button) => button.addEventListener("click", () => {
    lesson.tasks.push(newTask(button.dataset.addTask));
    lesson.rewardShown = false;
    saveLesson();
    renderSetup();
    overlayContent.querySelector(`[data-add-task="${button.dataset.addTask}"]`)?.focus();
  }));
  overlayContent.querySelectorAll("[data-remove-task]").forEach((button) => button.addEventListener("click", () => {
    lesson.tasks = lesson.tasks.filter((task) => task.id !== button.dataset.removeTask);
    lesson.rewardShown = false;
    saveLesson();
    renderSetup();
  }));
  overlayContent.querySelectorAll("[data-move-up], [data-move-down]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.moveUp || button.dataset.moveDown;
    const index = lesson.tasks.findIndex((task) => task.id === id);
    const nextIndex = button.dataset.moveUp ? index - 1 : index + 1;
    [lesson.tasks[index], lesson.tasks[nextIndex]] = [lesson.tasks[nextIndex], lesson.tasks[index]];
    saveLesson();
    renderSetup(id);
  }));
  document.querySelector("#start-lesson").addEventListener("click", () => {
    lesson.started = true;
    saveLesson();
    renderActiveLesson();
  });
  if (focusId) overlayContent.querySelector(`[data-setup-id="${focusId}"] button:not(:disabled)`)?.focus();
}

function renderActiveLesson() {
  const complete = lesson.tasks.filter((task) => task.completed).length;
  const total = lesson.tasks.length;
  const finished = complete === total;
  const celebrate = finished && !lesson.rewardShown;
  if (celebrate) {
    lesson.rewardShown = true;
    saveLesson();
    playTone("bell");
  }
  overlayContent.innerHTML = `
    <div class="lesson-screen active-screen">
      <div class="lesson-progress" aria-live="polite"><strong>${complete} OF ${total} COMPLETE</strong><div class="lesson-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${complete}"><span style="width:${(complete / total) * 100}%"></span></div></div>
      ${finished ? `<div class="lesson-reward${celebrate ? " celebrate" : ""}" role="status">${celebrate ? `<div class="celebration-stars" aria-hidden="true">&#9733; &#10022; &#9733; &#10022; &#9733;</div>` : ""}<strong>REWARD UNLOCKED!</strong><span>LESSON COMPLETE</span></div>` : ""}
      <div class="active-task-list">${lesson.tasks.map((task, index) => `<button type="button" class="active-task${task.completed ? " completed" : ""}" data-active-id="${task.id}" aria-pressed="${task.completed}"><span class="task-checkbox" aria-hidden="true">${task.completed ? "&#10003;" : ""}</span><span class="active-task-name"><b>${index + 1}.</b> ${task.name}</span></button>`).join("")}</div>
      <div class="lesson-controls"><button type="button" class="lesson-secondary" id="edit-lesson">EDIT LESSON</button><button type="button" class="lesson-secondary reset-button" id="reset-lesson">RESET LESSON</button></div>
      <div class="reset-confirm" id="reset-confirm" hidden><strong>Clear this lesson?</strong><button type="button" id="confirm-reset">YES, RESET</button><button type="button" id="cancel-reset">CANCEL</button></div>
    </div>`;

  overlayContent.querySelectorAll("[data-active-id]").forEach((button) => button.addEventListener("click", () => {
    const task = lesson.tasks.find((item) => item.id === button.dataset.activeId);
    task.completed = !task.completed;
    if (!task.completed) lesson.rewardShown = false;
    saveLesson();
    renderActiveLesson();
    overlayContent.querySelector(`[data-active-id="${task.id}"]`)?.focus();
  }));
  document.querySelector("#edit-lesson").addEventListener("click", () => {
    lesson.started = false;
    saveLesson();
    renderSetup();
  });
  document.querySelector("#reset-lesson").addEventListener("click", () => {
    document.querySelector("#reset-confirm").hidden = false;
    document.querySelector("#confirm-reset").focus();
  });
  document.querySelector("#cancel-reset").addEventListener("click", () => {
    document.querySelector("#reset-confirm").hidden = true;
    document.querySelector("#reset-lesson").focus();
  });
  document.querySelector("#confirm-reset").addEventListener("click", () => {
    lesson = { tasks: [], started: false, rewardShown: false };
    saveLesson();
    renderSetup();
  });
}

document.querySelectorAll("[data-tool]").forEach((trigger) => trigger.addEventListener("click", () => openTool(trigger.dataset.tool, trigger)));
closeButton.addEventListener("click", closeTool);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !overlay.hidden) closeTool();
});
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, String(soundEnabled));
  soundToggle.textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  if (soundEnabled) { prepareAudio(); playTone("bell"); }
});
fullscreenToggle.addEventListener("click", async () => {
  try {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  } catch { /* Fullscreen may be blocked by browser or embedding policy. */ }
});
document.addEventListener("fullscreenchange", () => { fullscreenToggle.textContent = document.fullscreenElement ? "EXIT FULLSCREEN" : "FULLSCREEN"; });
soundToggle.textContent = soundEnabled ? "SOUND ON" : "SOUND OFF";
soundToggle.setAttribute("aria-pressed", String(soundEnabled));
updateTilePreview();
restoreDashboardChoices();
if (timer.running) runTimerClock();
