"use strict";

/*
 * All level-specific content lives here. To add another mystery, copy the
 * object below and replace its text, scene image, hotspots, and answer data.
 */
const levels = [
  {
    title: "The Café Visitor",
    sceneDescription: "A cozy detective café in the evening",
    sceneImage: "assets/images/level-01-detective-cafe.png",
    sceneAspectRatio: "1402 / 1122",
    correctClue: "a steaming coffee cup",
    hotspots: [
      { label: "Steaming coffee cup", x: 45, y: 54, width: 18, height: 25, correct: true },
      { label: "Evidence board", x: 21, y: 5, width: 17, height: 30, correct: false },
      { label: "Café window", x: 67, y: 1, width: 31, height: 48, correct: false },
      { label: "Detective notebook", x: 23, y: 71, width: 20, height: 16, correct: false }
    ],
    question: "Why is the coffee cup important?",
    answers: [
      "It is still hot, so someone left only moments ago.",
      "It is the most expensive object in the café.",
      "It belongs to the detective."
    ],
    correctAnswer: 0,
    explanation: "The coffee is still steaming, which means the visitor left only a short time ago."
  }
];

const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  finish: document.getElementById("finishScreen")
};
const panels = {
  puzzle: document.getElementById("puzzleStage"),
  clue: document.getElementById("clueStage"),
  question: document.getElementById("questionStage"),
  explanation: document.getElementById("explanationStage")
};

const levelLabel = document.getElementById("levelLabel");
const puzzleBoard = document.getElementById("puzzleBoard");
const puzzleFeedback = document.getElementById("puzzleFeedback");
const puzzleContinue = document.getElementById("puzzleContinue");
const clueScene = document.getElementById("clueScene");
const clueFeedback = document.getElementById("clueFeedback");
const clueContinue = document.getElementById("clueContinue");
const questionForm = document.getElementById("questionForm");
const questionText = document.getElementById("questionText");
const answersList = document.getElementById("answersList");
const questionFeedback = document.getElementById("questionFeedback");
const questionContinue = document.getElementById("questionContinue");
const explanationText = document.getElementById("explanationText");
const nextLevelButton = document.getElementById("nextLevelButton");
const howModal = document.getElementById("howModal");

let currentLevelIndex = 0;
let pieceOrder = [];
let selectedPiece = null;
let draggedPiece = null;
let sceneUrl = "";

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle("active", key === name));
  levelLabel.hidden = name !== "game";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPanel(name) {
  Object.entries(panels).forEach(([key, panel]) => panel.classList.toggle("active", key === name));
  const order = ["puzzle", "clue", "question"];
  const currentStep = name === "explanation" ? 3 : order.indexOf(name);
  document.querySelectorAll(".progress-step").forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
    step.classList.toggle("done", index < currentStep);
  });
  document.querySelector(".progress").hidden = name === "explanation";

  const headings = {
    puzzle: ["Rebuild the evidence", "Assemble the scene", "Select two tiles to swap them, or drag one tile onto another."],
    clue: ["Look closely", "Find the key clue", "Study the completed scene and click the detail that matters most."],
    question: ["Connect the evidence", "What does the clue mean?", "Choose an answer, then check your reasoning."]
  };
  const heading = document.querySelector(".stage-heading");
  heading.hidden = name === "explanation";
  if (headings[name]) {
    document.getElementById("stageKicker").textContent = headings[name][0];
    document.getElementById("stageTitle").textContent = headings[name][1];
    document.getElementById("stageInstruction").textContent = headings[name][2];
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function startLevel(index) {
  currentLevelIndex = index;
  const level = levels[index];
  levelLabel.textContent = `Level ${index + 1}`;
  sceneUrl = level.sceneImage;
  puzzleBoard.style.aspectRatio = level.sceneAspectRatio;
  clueScene.style.aspectRatio = level.sceneAspectRatio;
  setupPuzzle();
  setupClueStage();
  setupQuestionStage();
  explanationText.textContent = level.explanation;
  showScreen("game");
  showPanel("puzzle");
}

function shuffledPositions(size) {
  const result = Array.from({ length: size }, (_, index) => index);
  do {
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
  } while (result.every((value, index) => value === index));
  return result;
}

function setupPuzzle() {
  pieceOrder = shuffledPositions(16);
  selectedPiece = null;
  puzzleFeedback.textContent = "";
  puzzleFeedback.className = "feedback";
  puzzleContinue.disabled = true;
  renderPuzzle();
}

function renderPuzzle() {
  puzzleBoard.innerHTML = "";
  pieceOrder.forEach((correctPosition, boardPosition) => {
    const piece = document.createElement("button");
    const row = Math.floor(correctPosition / 4);
    const column = correctPosition % 4;
    piece.type = "button";
    piece.className = "puzzle-piece";
    piece.dataset.boardPosition = String(boardPosition);
    piece.draggable = true;
    piece.setAttribute("aria-label", `Puzzle tile ${boardPosition + 1}`);
    piece.style.backgroundImage = `url("${sceneUrl}")`;
    piece.style.backgroundSize = "400% 400%";
    piece.style.backgroundPosition = `${column * 100 / 3}% ${row * 100 / 3}%`;
    piece.addEventListener("click", selectPiece);
    piece.addEventListener("dragstart", dragStart);
    piece.addEventListener("dragover", event => event.preventDefault());
    piece.addEventListener("drop", dropPiece);
    piece.addEventListener("dragend", () => piece.classList.remove("dragging"));
    puzzleBoard.appendChild(piece);
  });
}

function selectPiece(event) {
  const position = Number(event.currentTarget.dataset.boardPosition);
  if (selectedPiece === null) {
    selectedPiece = position;
    event.currentTarget.classList.add("selected");
    return;
  }
  if (selectedPiece === position) {
    selectedPiece = null;
    event.currentTarget.classList.remove("selected");
    return;
  }
  swapPieces(selectedPiece, position);
}

function dragStart(event) {
  draggedPiece = Number(event.currentTarget.dataset.boardPosition);
  event.currentTarget.classList.add("dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", String(draggedPiece));
}

function dropPiece(event) {
  event.preventDefault();
  const from = draggedPiece ?? Number(event.dataTransfer.getData("text/plain"));
  const to = Number(event.currentTarget.dataset.boardPosition);
  if (Number.isInteger(from) && from !== to) swapPieces(from, to);
  draggedPiece = null;
}

function swapPieces(first, second) {
  [pieceOrder[first], pieceOrder[second]] = [pieceOrder[second], pieceOrder[first]];
  selectedPiece = null;
  renderPuzzle();
  if (pieceOrder.every((value, index) => value === index)) {
    puzzleFeedback.textContent = "Puzzle Complete!";
    puzzleFeedback.className = "feedback success";
    puzzleContinue.disabled = false;
  }
}

function setupClueStage() {
  const level = levels[currentLevelIndex];
  clueScene.innerHTML = "";
  clueScene.style.backgroundImage = `url("${sceneUrl}")`;
  clueFeedback.textContent = "Study the scene and click the important clue.";
  clueFeedback.className = "feedback";
  clueContinue.disabled = true;
  level.hotspots.forEach(hotspotData => {
    const hotspot = document.createElement("button");
    hotspot.type = "button";
    hotspot.className = "hotspot";
    hotspot.setAttribute("aria-label", hotspotData.label);
    Object.assign(hotspot.style, {
      left: `${hotspotData.x}%`, top: `${hotspotData.y}%`,
      width: `${hotspotData.width}%`, height: `${hotspotData.height}%`
    });
    hotspot.addEventListener("click", () => checkHotspot(hotspot, hotspotData.correct));
    clueScene.appendChild(hotspot);
  });
}

function checkHotspot(hotspot, isCorrect) {
  if (isCorrect) {
    clueFeedback.textContent = "Good observation!";
    clueFeedback.className = "feedback success";
    clueContinue.disabled = false;
    hotspot.classList.add("correct");
    clueScene.querySelectorAll(".hotspot").forEach(button => { button.disabled = true; });
  } else {
    clueFeedback.textContent = "That is not the key clue. Look again.";
    clueFeedback.className = "feedback";
  }
}

function setupQuestionStage() {
  const level = levels[currentLevelIndex];
  questionText.textContent = level.question;
  answersList.innerHTML = "";
  questionFeedback.textContent = "";
  questionFeedback.className = "feedback";
  questionContinue.disabled = true;
  document.getElementById("checkAnswer").disabled = false;
  level.answers.forEach((answer, index) => {
    const label = document.createElement("label");
    label.className = "answer-option";
    const letter = String.fromCharCode(65 + index);
    label.innerHTML = `<input type="radio" name="answer" value="${index}"><span><strong>${letter}.</strong> ${answer}</span>`;
    answersList.appendChild(label);
  });
}

function checkAnswer(event) {
  event.preventDefault();
  const selected = questionForm.querySelector("input[name='answer']:checked");
  if (!selected || Number(selected.value) !== levels[currentLevelIndex].correctAnswer) {
    questionFeedback.textContent = "Not quite. Try again.";
    questionFeedback.className = "feedback";
    return;
  }
  questionFeedback.textContent = "Correct!";
  questionFeedback.className = "feedback success";
  questionContinue.disabled = false;
  document.getElementById("checkAnswer").disabled = true;
  questionForm.querySelectorAll("input").forEach(input => { input.disabled = true; });
}

function finishLevel() {
  const hasNextLevel = currentLevelIndex < levels.length - 1;
  nextLevelButton.hidden = !hasNextLevel;
  document.getElementById("solvedMessage").textContent = `You solved Level ${currentLevelIndex + 1}: ${levels[currentLevelIndex].title}.`;
  showScreen("finish");
}

function openHowModal() {
  howModal.classList.add("active");
  howModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("closeHowButton").focus();
}

function closeHowModal() {
  howModal.classList.remove("active");
  howModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.getElementById("howButton").focus();
}

document.getElementById("startButton").addEventListener("click", () => startLevel(0));
document.getElementById("howButton").addEventListener("click", openHowModal);
document.getElementById("closeHowButton").addEventListener("click", closeHowModal);
document.getElementById("understoodButton").addEventListener("click", closeHowModal);
howModal.addEventListener("click", event => { if (event.target === howModal) closeHowModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && howModal.classList.contains("active")) closeHowModal(); });
puzzleContinue.addEventListener("click", () => showPanel("clue"));
clueContinue.addEventListener("click", () => showPanel("question"));
questionForm.addEventListener("submit", checkAnswer);
questionContinue.addEventListener("click", () => showPanel("explanation"));
document.getElementById("finishCase").addEventListener("click", finishLevel);
document.getElementById("playAgainButton").addEventListener("click", () => startLevel(currentLevelIndex));
nextLevelButton.addEventListener("click", () => startLevel(currentLevelIndex + 1));
