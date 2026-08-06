"use strict";

/* Add or edit missions here. All level-specific content lives in this array. */
const levels = [
  {
    title: "The Broken Crossing",
    story: "The usual road home crosses an old valley. Investigate the landmarks and find a route that avoids the damaged crossing.",
    instruction: "Investigate all three marked locations before choosing a route.",
    image: "assets/images/level-01-library.png",
    imageAlt: "A valley route with a forest trail, stone bridge, and river bank",
    aspectRatio: "4 / 3",
    clues: [
      { location: "Old tree", text: "The trail beside the old tree is firm and recently used.", x: 18, y: 35, width: 13, height: 20 },
      { location: "Stone bridge", text: "The bridge is broken in the middle and cannot be crossed safely.", x: 47, y: 42, width: 17, height: 18 },
      { location: "River bank", text: "The river bank is soft, steep, and slippery after rain.", x: 73, y: 62, width: 16, height: 18 }
    ],
    question: "Which path is safe?",
    answers: ["Left forest trail", "Stone bridge", "River bank"],
    correctAnswer: 0,
    explanation: "The firm, recently used forest trail is safe. The bridge is broken and the wet river bank is too slippery."
  },
  {
    title: "The Lantern Pass",
    story: "Evening is settling over an abandoned woodland pass. Five discoveries will reveal which way still leads safely onward.",
    instruction: "Find all five clues. Remember that one observation may be misleading.",
    image: "assets/images/level-02-egyptian-museum.png",
    imageAlt: "A woodland pass with a gate, cabin, lantern, cave, and abandoned cart",
    aspectRatio: "4 / 3",
    clues: [
      { location: "Iron gate", text: "The gate is locked, but a maintained footpath continues beside it.", x: 13, y: 45, width: 14, height: 22 },
      { location: "Cabin", text: "The cabin chimney is cold and no one answers the door.", x: 64, y: 26, width: 18, height: 22 },
      { location: "Lantern", text: "The lantern is glowing, but its pole points toward an old service road.", x: 41, y: 37, width: 10, height: 16, misleading: true },
      { location: "Cave", text: "Loose stones are falling near the cave entrance.", x: 80, y: 48, width: 15, height: 19 },
      { location: "Abandoned cart", text: "Fresh wheel tracks beside the cart join the maintained footpath.", x: 30, y: 65, width: 18, height: 18 }
    ],
    question: "Which route should you follow?",
    answers: ["The lantern's service road", "The maintained path beside the gate", "The cave passage"],
    correctAnswer: 1,
    explanation: "The wheel tracks confirm that the maintained path beside the gate is in use. The lantern points to an old service road, while falling stones make the cave unsafe."
  },
  {
    title: "The Hidden Ridge",
    story: "Your final mission reaches a remote ridge where every sign matters. Combine six clues to identify the only dependable route.",
    instruction: "Collect all six clues, then combine the evidence before answering.",
    image: "assets/images/level-03-inventors-study.png",
    imageAlt: "A remote ridge with a river, rope bridge, footprints, watch cabin, gate, and pine trail",
    aspectRatio: "4 / 3",
    clues: [
      { location: "Rope bridge", text: "Several ropes are badly frayed and one plank is missing.", x: 44, y: 38, width: 20, height: 18 },
      { location: "Footprints", text: "Fresh footprints turn away from the bridge toward the pine trail.", x: 32, y: 67, width: 15, height: 13 },
      { location: "River", text: "The current is fast and the stepping stones are underwater.", x: 61, y: 70, width: 24, height: 16 },
      { location: "Watch cabin", text: "A route map inside marks the pine trail as open.", x: 72, y: 24, width: 17, height: 22 },
      { location: "Wooden gate", text: "The gate to the cliff road carries a fresh landslide warning.", x: 15, y: 48, width: 14, height: 19 },
      { location: "Pine trail", text: "Cut branches and new trail markers show recent maintenance.", x: 49, y: 16, width: 18, height: 18 }
    ],
    question: "Which route safely completes the mission?",
    answers: ["Cross the rope bridge", "Take the cliff road", "Follow the marked pine trail", "Wade across the river"],
    correctAnswer: 2,
    explanation: "The map, fresh footprints, cut branches, and new markers all confirm the pine trail is open. Every other route has a clear hazard."
  }
];

const soundManager = new SoundManager({
  basePath: "assets/sounds/",
  sounds: { button: "button.ogg", piece: "piece.ogg", correct: "correct.ogg", wrong: "wrong.ogg", next: "next.ogg", victory: "victory.ogg" }
});

const screens = {
  story: document.getElementById("storyScreen"),
  game: document.getElementById("gameScreen"),
  success: document.getElementById("successScreen")
};
const levelLabel = document.getElementById("levelLabel");
const storyTitle = document.getElementById("storyTitle");
const storyText = document.getElementById("storyText");
const missionTitle = document.getElementById("missionTitle");
const missionInstruction = document.getElementById("missionInstruction");
const scene = document.getElementById("scene");
const sceneImage = document.getElementById("sceneImage");
const hotspots = document.getElementById("hotspots");
const clueCount = document.getElementById("clueCount");
const latestClue = document.getElementById("latestClue");
const clueList = document.getElementById("clueList");
const questionForm = document.getElementById("questionForm");
const questionText = document.getElementById("questionText");
const answersList = document.getElementById("answersList");
const answerFeedback = document.getElementById("answerFeedback");
const successKicker = document.getElementById("successKicker");
const successTitle = document.getElementById("successTitle");
const explanationText = document.getElementById("explanationText");
const scoreText = document.getElementById("scoreText");
const nextButton = document.getElementById("nextButton");
const rulesModal = document.getElementById("rulesModal");

let currentLevelIndex = 0;
let foundClues = new Set();
let wrongAttempts = 0;
let score = 0;

function showScreen(name) {
  Object.entries(screens).forEach(([key, screenElement]) => screenElement.classList.toggle("active", key === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function prepareStory(index, showMissionStory = true) {
  currentLevelIndex = index;
  const level = levels[index];
  levelLabel.textContent = `Level ${index + 1}`;
  if (showMissionStory) {
    storyTitle.textContent = level.title;
    storyText.textContent = level.story;
  } else {
    storyTitle.textContent = "Secret Path";
    storyText.textContent = "Explore the scene. Follow the clues. Choose the safest route.";
  }
  showScreen("story");
}

function startLevel() {
  const level = levels[currentLevelIndex];
  foundClues = new Set();
  wrongAttempts = 0;
  missionTitle.textContent = level.title;
  missionInstruction.textContent = level.instruction;
  scene.style.aspectRatio = level.aspectRatio;
  sceneImage.hidden = false;
  sceneImage.src = level.image;
  sceneImage.alt = level.imageAlt;
  sceneImage.onerror = () => { sceneImage.hidden = true; };
  latestClue.textContent = "Choose a marked location to investigate.";
  clueList.innerHTML = "";
  questionForm.hidden = true;
  questionForm.reset();
  answerFeedback.textContent = "";
  renderHotspots();
  updateClueProgress();
  showScreen("game");
}

function renderHotspots() {
  hotspots.innerHTML = "";
  levels[currentLevelIndex].clues.forEach((clue, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hotspot";
    button.setAttribute("aria-label", `Investigate ${clue.location}`);
    Object.assign(button.style, { left: `${clue.x}%`, top: `${clue.y}%`, width: `${clue.width}%`, height: `${clue.height}%` });
    button.addEventListener("click", () => collectClue(index, button));
    hotspots.appendChild(button);
  });
}

function collectClue(index, button) {
  const level = levels[currentLevelIndex];
  const clue = level.clues[index];
  latestClue.textContent = clue.text;
  if (foundClues.has(index)) return;
  foundClues.add(index);
  button.classList.add("found");
  const item = document.createElement("li");
  item.innerHTML = `<strong>${clue.location}</strong><span>${clue.text}</span>`;
  clueList.appendChild(item);
  updateClueProgress();
  if (foundClues.size === level.clues.length) revealQuestion();
}

function updateClueProgress() {
  clueCount.textContent = `${foundClues.size} / ${levels[currentLevelIndex].clues.length}`;
}

function revealQuestion() {
  const level = levels[currentLevelIndex];
  questionText.textContent = level.question;
  answersList.innerHTML = "";
  level.answers.forEach((answer, index) => {
    const label = document.createElement("label");
    label.className = "answer-option";
    label.innerHTML = `<input type="radio" name="route" value="${index}"><span><strong>${String.fromCharCode(65 + index)}.</strong> ${answer}</span>`;
    answersList.appendChild(label);
  });
  questionForm.hidden = false;
  latestClue.textContent = "All clues collected. Choose the safest route.";
  questionForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function checkAnswer(event) {
  event.preventDefault();
  const selected = questionForm.querySelector("input[name='route']:checked");
  if (!selected) {
    answerFeedback.textContent = "Choose a route first.";
    return;
  }
  if (Number(selected.value) !== levels[currentLevelIndex].correctAnswer) {
    wrongAttempts += 1;
    soundManager.play("wrong");
    answerFeedback.textContent = "That route is not safe. Review the clues and try again.";
    return;
  }
  soundManager.play("correct");
  score += Math.max(40, 100 - wrongAttempts * 20);
  showSuccess();
}

function showSuccess() {
  const isFinalLevel = currentLevelIndex === levels.length - 1;
  explanationText.textContent = levels[currentLevelIndex].explanation;
  scoreText.textContent = isFinalLevel ? `Final score: ${score} / ${levels.length * 100}` : `Score: ${score}`;
  successKicker.textContent = isFinalLevel ? "All routes secured" : "Safe route found";
  successTitle.textContent = isFinalLevel ? "MISSION COMPLETE" : "Mission Solved!";
  nextButton.hidden = isFinalLevel;
  showScreen("success");
  if (isFinalLevel) soundManager.play("victory");
}

function openRules() {
  rulesModal.classList.add("active");
  rulesModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("closeRulesButton").focus();
}

function closeRules() {
  rulesModal.classList.remove("active");
  rulesModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.getElementById("rulesButton").focus();
}

document.getElementById("startButton").addEventListener("click", startLevel);
document.getElementById("rulesButton").addEventListener("click", openRules);
document.getElementById("closeRulesButton").addEventListener("click", closeRules);
document.getElementById("understoodButton").addEventListener("click", closeRules);
rulesModal.addEventListener("click", event => { if (event.target === rulesModal) closeRules(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && rulesModal.classList.contains("active")) closeRules(); });
questionForm.addEventListener("submit", checkAnswer);
nextButton.addEventListener("click", () => {
  soundManager.play("next");
  prepareStory(currentLevelIndex + 1);
});
document.addEventListener("click", event => {
  if (event.target instanceof Element && event.target.closest("button")) soundManager.play("button");
});

prepareStory(0, false);
