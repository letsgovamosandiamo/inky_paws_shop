"use strict";

const levels = window.flashbackLevels;
const OBSERVATION_SECONDS = 8;
const FADE_DURATION_MS = 650;
const soundManager = new SoundManager({
  basePath: "../mosaic-mystery/assets/sounds/",
  sounds: { correct: "correct.ogg", wrong: "wrong.ogg", victory: "victory.ogg", next: "next.ogg", button: "button.ogg" }
});

const screens = { start: document.getElementById("startScreen"), observation: document.getElementById("observationScreen"), question: document.getElementById("questionScreen"), result: document.getElementById("resultScreen") };
const levelLabel = document.getElementById("levelLabel");
const sceneImage = document.getElementById("sceneImage");
const observationTitle = document.getElementById("observationTitle");
const timerValue = document.getElementById("timerValue");
const fadeCurtain = document.getElementById("fadeCurtain");
const questionProgress = document.getElementById("questionProgress");
const progressFill = document.getElementById("progressFill");
const caseName = document.getElementById("caseName");
const questionTitle = document.getElementById("questionTitle");
const questionForm = document.getElementById("questionForm");
const answersList = document.getElementById("answersList");
const feedback = document.getElementById("feedback");
const nextCaseButton = document.getElementById("nextCaseButton");
const howModal = document.getElementById("howModal");

let currentLevelIndex = 0;
let currentQuestionIndex = 0;
let correctAnswers = 0;
let observationTimer = null;

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => element.classList.toggle("active", key === name));
  levelLabel.hidden = name === "start" || name === "observation";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startLevel(index) {
  currentLevelIndex = index;
  currentQuestionIndex = 0;
  correctAnswers = 0;
  const level = levels[index];
  levelLabel.textContent = `CASE ${String(index + 1).padStart(2, "0")}`;
  sceneImage.src = level.sceneImage;
  sceneImage.alt = level.sceneAlt;
  observationTitle.textContent = level.title;
  beginObservation();
}

function beginObservation() {
  clearInterval(observationTimer);
  fadeCurtain.classList.remove("active");
  timerValue.textContent = String(OBSERVATION_SECONDS);
  showScreen("observation");
  let secondsRemaining = OBSERVATION_SECONDS;
  observationTimer = window.setInterval(() => {
    secondsRemaining -= 1;
    timerValue.textContent = String(secondsRemaining);
    if (secondsRemaining === 0) {
      clearInterval(observationTimer);
      fadeCurtain.classList.add("active");
      window.setTimeout(() => { renderQuestion(); showScreen("question"); }, FADE_DURATION_MS);
    }
  }, 1000);
}

function renderQuestion() {
  const level = levels[currentLevelIndex];
  const question = level.questions[currentQuestionIndex];
  questionProgress.textContent = `QUESTION ${currentQuestionIndex + 1} OF ${level.questions.length}`;
  progressFill.style.width = `${(currentQuestionIndex + 1) / level.questions.length * 100}%`;
  caseName.textContent = level.title;
  questionTitle.textContent = question.prompt;
  answersList.innerHTML = "";
  feedback.textContent = "";
  question.answers.forEach((answer, index) => {
    const label = document.createElement("label");
    label.className = "answer-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "memoryAnswer";
    input.value = String(index);
    const text = document.createElement("span");
    text.innerHTML = `<strong>${String.fromCharCode(65 + index)}.</strong> `;
    text.append(document.createTextNode(answer));
    label.append(input, text);
    answersList.appendChild(label);
  });
}

function submitAnswer(event) {
  event.preventDefault();
  const selected = questionForm.querySelector("input[name='memoryAnswer']:checked");
  if (!selected) { feedback.textContent = "Select an answer before filing your memory."; return; }
  const question = levels[currentLevelIndex].questions[currentQuestionIndex];
  if (Number(selected.value) === question.correctAnswer) { correctAnswers += 1; soundManager.play("correct"); }
  else soundManager.play("wrong");
  currentQuestionIndex += 1;
  if (currentQuestionIndex < levels[currentLevelIndex].questions.length) renderQuestion();
  else showResults();
}

function showResults() {
  const total = levels[currentLevelIndex].questions.length;
  const accuracy = Math.round(correctAnswers / total * 100);
  document.getElementById("correctCount").textContent = `${correctAnswers} / ${total}`;
  document.getElementById("accuracyValue").textContent = `${accuracy}%`;
  document.getElementById("resultMessage").textContent = `${levels[currentLevelIndex].title} has been reconstructed from your memory.`;
  nextCaseButton.textContent = "Next Case";
  showScreen("result");
  soundManager.play("victory");
}

function advanceCase() {
  soundManager.play("next");
  startLevel(currentLevelIndex < levels.length - 1 ? currentLevelIndex + 1 : 0);
}

function openHow() { howModal.classList.add("active"); howModal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; document.getElementById("closeHowButton").focus(); }
function closeHow() { howModal.classList.remove("active"); howModal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; document.getElementById("howButton").focus(); }

document.getElementById("startButton").addEventListener("click", () => startLevel(0));
document.getElementById("howButton").addEventListener("click", openHow);
document.getElementById("closeHowButton").addEventListener("click", closeHow);
document.getElementById("understoodButton").addEventListener("click", closeHow);
howModal.addEventListener("click", event => { if (event.target === howModal) closeHow(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && howModal.classList.contains("active")) closeHow(); });
questionForm.addEventListener("submit", submitAnswer);
nextCaseButton.addEventListener("click", advanceCase);
document.addEventListener("click", event => { if (event.target instanceof Element && event.target.closest("button")) soundManager.play("button"); });
