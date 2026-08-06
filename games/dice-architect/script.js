"use strict";

/*
 * Add future themed layouts here. A level owns its board, tiles, counts,
 * human-readable rules, validation data, hints, and completion message.
 */
const levels = [
  {
    title: "Perfect Village",
    theme: "Village Foundations",
    boardSize: 5,
    tiles: [
      { id: "house-1", type: "house", image: "assets/images/house.png" },
      { id: "house-2", type: "house", image: "assets/images/house.png" },
      { id: "tree-1", type: "tree", image: "assets/images/tree.png" },
      { id: "tree-2", type: "tree", image: "assets/images/tree.png" },
      { id: "bridge-1", type: "bridge", image: "assets/images/bridge.png" },
      { id: "river-1", type: "river", image: "assets/images/river.png" },
      { id: "river-2", type: "river", image: "assets/images/river.png" },
      { id: "rock-1", type: "rock", image: "assets/images/rock.png" },
      { id: "well-1", type: "well", image: "assets/images/well.png" },
      { id: "windmill-1", type: "windmill", image: "assets/images/windmill.png" }
    ],
    requiredCounts: { house: 2, tree: 2, bridge: 1, river: 2, rock: 1, well: 1, windmill: 1 },
    rules: [
      { type: "adjacent", subject: "house", object: "tree", text: "At least one house must be next to a tree.", hint: "Move a house or tree so their sides touch." },
      { type: "adjacent", subject: "bridge", object: "river", text: "The bridge must be next to the river.", hint: "The bridge needs to share a side with the river." },
      { type: "notAdjacent", subject: "rock", object: "house", text: "The rock must not be next to either house.", hint: "Move the rock away from both houses." },
      { type: "distance", subject: "well", object: "house", max: 2, text: "The well must be within two grid cells of a house.", hint: "Bring the well within two moves of a house." },
      { type: "notAdjacent", subject: "windmill", object: "river", text: "The windmill must not be next to a river.", hint: "Move the windmill away from both river tiles." },
      { type: "sameRow", subject: "house", object: "well", text: "A house and the well must be in the same row.", hint: "Line up the well and a house horizontally." },
      { type: "sameColumn", subject: "windmill", object: "well", text: "The windmill and well must be in the same column.", hint: "Line up the windmill and well vertically." },
      { type: "between", subject: "bridge", object: "river", text: "The bridge must be between the two river tiles in one row or column.", hint: "Put the bridge between both river tiles on one straight line." }
    ],
    successText: "Your peaceful village follows every building rule."
  },
  {
    title: "Village Expansion",
    theme: "Growing Community",
    boardSize: 6,
    tiles: [
      { id: "house-1", type: "house", image: "assets/images/house.png" },
      { id: "house-2", type: "house", image: "assets/images/house.png" },
      { id: "tree-1", type: "tree", image: "assets/images/tree.png" },
      { id: "tree-2", type: "tree", image: "assets/images/tree.png" },
      { id: "tree-3", type: "tree", image: "assets/images/tree.png" },
      { id: "bridge-1", type: "bridge", image: "assets/images/bridge.png" },
      { id: "river-1", type: "river", image: "assets/images/river.png" },
      { id: "river-2", type: "river", image: "assets/images/river.png" },
      { id: "rock-1", type: "rock", image: "assets/images/rock.png" },
      { id: "rock-2", type: "rock", image: "assets/images/rock.png" },
      { id: "well-1", type: "well", image: "assets/images/well.png" },
      { id: "well-2", type: "well", image: "assets/images/well.png" },
      { id: "windmill-1", type: "windmill", image: "assets/images/windmill.png" },
      { id: "windmill-2", type: "windmill", image: "assets/images/windmill.png" },
      { id: "windmill-3", type: "windmill", image: "assets/images/windmill.png" }
    ],
    requiredCounts: { house: 2, tree: 3, bridge: 1, river: 2, rock: 2, well: 2, windmill: 3 },
    rules: [
      { type: "adjacent", subject: "house", object: "tree", text: "The house must be next to the tree.", hint: "Move the house or tree so their sides touch." },
      { type: "adjacent", subject: "bridge", object: "river", text: "The bridge must be next to the river.", hint: "Place the bridge beside the river, not diagonally from it." },
      { type: "notAdjacent", subject: "rock", object: "house", text: "The rock must not be next to the house.", hint: "The rock is too close to the house." },
      { type: "distance", subject: "well", object: "house", max: 2, text: "The well must be within two grid cells of the house.", hint: "Bring the well within two moves of the house." },
      { type: "notAdjacent", subject: "windmill", object: "river", text: "The windmill must not be next to the river.", hint: "Move the windmill away from the riverbank." }
      ,{ type: "sameRow", subject: "house", object: "well", text: "At least one house and well must be in the same row.", hint: "Line up a house and well horizontally." }
      ,{ type: "sameColumn", subject: "windmill", object: "well", text: "At least one windmill and well must be in the same column.", hint: "Line up a windmill and well vertically." }
      ,{ type: "between", subject: "bridge", object: "river", text: "The bridge must be between the two river tiles in one row or column.", hint: "Put the bridge between both river tiles on one straight line." }
    ],
    successText: "The expanded village is balanced, useful, and safe."
  },
  {
    title: "Master Architect",
    theme: "Grand Village Plan",
    boardSize: 7,
    tiles: [
      { id: "house-1", type: "house", image: "assets/images/house.png" },
      { id: "house-2", type: "house", image: "assets/images/house.png" },
      { id: "house-3", type: "house", image: "assets/images/house.png" },
      { id: "tree-1", type: "tree", image: "assets/images/tree.png" },
      { id: "tree-2", type: "tree", image: "assets/images/tree.png" },
      { id: "tree-3", type: "tree", image: "assets/images/tree.png" },
      { id: "tree-4", type: "tree", image: "assets/images/tree.png" },
      { id: "bridge-1", type: "bridge", image: "assets/images/bridge.png" },
      { id: "bridge-2", type: "bridge", image: "assets/images/bridge.png" },
      { id: "river-1", type: "river", image: "assets/images/river.png" },
      { id: "river-2", type: "river", image: "assets/images/river.png" },
      { id: "river-3", type: "river", image: "assets/images/river.png" },
      { id: "river-4", type: "river", image: "assets/images/river.png" },
      { id: "rock-1", type: "rock", image: "assets/images/rock.png" },
      { id: "rock-2", type: "rock", image: "assets/images/rock.png" },
      { id: "well-1", type: "well", image: "assets/images/well.png" },
      { id: "well-2", type: "well", image: "assets/images/well.png" },
      { id: "windmill-1", type: "windmill", image: "assets/images/windmill.png" },
      { id: "windmill-2", type: "windmill", image: "assets/images/windmill.png" },
      { id: "windmill-3", type: "windmill", image: "assets/images/windmill.png" }
    ],
    requiredCounts: { house: 3, tree: 4, bridge: 2, river: 4, rock: 2, well: 2, windmill: 3 },
    rules: [
      { type: "adjacent", subject: "house", object: "tree", text: "The house must be next to at least one tree.", hint: "A tree needs to share a side with the house." },
      { type: "notAdjacent", subject: "rock", object: "house", text: "No rock may be next to the house.", hint: "At least one rock is too close to the house." },
      { type: "distance", subject: "well", object: "house", max: 2, text: "The well must be within two grid cells of the house.", hint: "The well is too far from the house." },
      { type: "notAdjacent", subject: "windmill", object: "river", text: "The windmill must not be next to either river tile.", hint: "Move the windmill away from the river tiles." },
      { type: "sameRow", subject: "house", object: "well", text: "The house and well must be in the same row.", hint: "Line up the house and well horizontally." },
      { type: "sameColumn", subject: "windmill", object: "well", text: "The windmill and well must be in the same column.", hint: "Line up the windmill and well vertically." },
      { type: "between", subject: "bridge", object: "river", text: "A bridge must be between two river tiles in one row or column.", hint: "Put a bridge between two river tiles on one straight line." },
      { type: "adjacent", subject: "bridge", object: "river", text: "At least one bridge must be next to a river tile.", hint: "Move a bridge beside a river tile." }
    ],
    successText: "Every part of your grand village plan works together perfectly."
  }
];

const soundManager = new SoundManager({
  basePath: "assets/sounds/",
  sounds: {
    button: "button.ogg",
    piece: "piece.ogg",
    correct: "correct.ogg",
    wrong: "wrong.ogg",
    next: "next.ogg",
    victory: "victory.ogg"
  }
});
const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  complete: document.getElementById("completeScreen"),
  ending: document.getElementById("endingScreen")
};
const levelLabel = document.getElementById("levelLabel");
const themeLabel = document.getElementById("themeLabel");
const levelTitle = document.getElementById("levelTitle");
const rulesList = document.getElementById("rulesList");
const board = document.getElementById("board");
const tileTray = document.getElementById("tileTray");
const placedCount = document.getElementById("placedCount");
const feedback = document.getElementById("feedback");
const successText = document.getElementById("successText");
const nextButton = document.getElementById("nextButton");
const howModal = document.getElementById("howModal");

let currentLevelIndex = 0;
let dragState = null;

function currentLevel() {
  return levels[currentLevelIndex];
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, element]) => element.classList.toggle("active", key === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function makeTile(tileData) {
  const tile = document.createElement("button");
  tile.className = "object-tile";
  tile.type = "button";
  tile.dataset.tileId = tileData.id;
  tile.dataset.type = tileData.type;
  tile.setAttribute("aria-label", `${tileData.type} tile. Drag to place.`);
  tile.innerHTML = `<img class="object-image" src="${tileData.image}" alt="" draggable="false"><span>${tileData.type}</span>`;
  tile.addEventListener("pointerdown", beginDrag);
  return tile;
}

function loadLevel(index) {
  currentLevelIndex = index;
  const level = currentLevel();
  levelLabel.textContent = `Level ${index + 1}`;
  themeLabel.textContent = level.theme;
  levelTitle.textContent = level.title;
  board.style.gridTemplateColumns = `repeat(${level.boardSize}, 1fr)`;
  board.innerHTML = "";
  tileTray.innerHTML = "";
  rulesList.innerHTML = "";
  feedback.textContent = "";
  feedback.className = "feedback";

  for (let index = 0; index < level.boardSize ** 2; index += 1) {
    const cell = document.createElement("div");
    cell.className = "board-cell";
    cell.dataset.row = Math.floor(index / level.boardSize);
    cell.dataset.col = index % level.boardSize;
    cell.setAttribute("aria-label", `Row ${Number(cell.dataset.row) + 1}, column ${Number(cell.dataset.col) + 1}`);
    board.appendChild(cell);
  }

  level.tiles.forEach(tileData => tileTray.appendChild(makeTile(tileData)));
  level.rules.forEach(rule => {
    const item = document.createElement("li");
    item.textContent = rule.text;
    rulesList.appendChild(item);
  });
  updatePlacedCount();
  showScreen("game");
}

function beginDrag(event) {
  if (event.button !== 0 && event.pointerType === "mouse") return;
  event.preventDefault();
  const tile = event.currentTarget;
  const ghost = tile.cloneNode(true);
  ghost.classList.add("drag-ghost");
  ghost.removeAttribute("id");
  document.body.appendChild(ghost);
  tile.classList.add("drag-source");
  dragState = { tile, ghost, pointerId: event.pointerId, moved: false };
  moveGhost(event.clientX, event.clientY);
  window.addEventListener("pointermove", moveDrag, { passive: false });
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", cancelDrag);
}

function moveGhost(x, y) {
  if (!dragState) return;
  dragState.ghost.style.left = `${x}px`;
  dragState.ghost.style.top = `${y}px`;
}

function clearDropTargets() {
  document.querySelectorAll(".drop-target").forEach(element => element.classList.remove("drop-target"));
}

function findDropTarget(x, y) {
  const element = document.elementFromPoint(x, y);
  if (!element) return null;
  return element.closest(".board-cell, .tile-tray");
}

function moveDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  event.preventDefault();
  dragState.moved = true;
  moveGhost(event.clientX, event.clientY);
  clearDropTargets();
  const target = findDropTarget(event.clientX, event.clientY);
  if (target && (target === tileTray || !target.querySelector(".object-tile"))) target.classList.add("drop-target");
}

function endDrag(event) {
  if (!dragState || event.pointerId !== dragState.pointerId) return;
  const target = findDropTarget(event.clientX, event.clientY);
  const canPlace = target && (target === tileTray || !target.querySelector(".object-tile"));
  if (canPlace && dragState.tile.parentElement !== target) {
    target.appendChild(dragState.tile);
    soundManager.play("piece");
    feedback.textContent = "";
    updatePlacedCount();
  } else if (target && target.classList.contains("board-cell") && !canPlace) {
    feedback.textContent = "That grid cell is occupied. Choose an empty cell.";
  }
  finishDrag();
}

function cancelDrag(event) {
  if (dragState && event.pointerId === dragState.pointerId) finishDrag();
}

function finishDrag() {
  if (!dragState) return;
  dragState.tile.classList.remove("drag-source");
  dragState.ghost.remove();
  dragState = null;
  clearDropTargets();
  window.removeEventListener("pointermove", moveDrag);
  window.removeEventListener("pointerup", endDrag);
  window.removeEventListener("pointercancel", cancelDrag);
}

function updatePlacedCount() {
  const total = currentLevel().tiles.length;
  const placed = board.querySelectorAll(".object-tile").length;
  placedCount.textContent = `${placed} / ${total}`;
}

function getPlacements() {
  return [...board.querySelectorAll(".board-cell")].flatMap(cell => {
    const tile = cell.querySelector(".object-tile");
    return tile ? [{ id: tile.dataset.tileId, type: tile.dataset.type, row: Number(cell.dataset.row), col: Number(cell.dataset.col) }] : [];
  });
}

function objectsOfType(placements, type) {
  return placements.filter(item => item.type === type);
}

function orthogonalDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

const ruleValidators = {
  adjacent(rule, placements) {
    return objectsOfType(placements, rule.subject).some(a => objectsOfType(placements, rule.object).some(b => orthogonalDistance(a, b) === 1));
  },
  notAdjacent(rule, placements) {
    return objectsOfType(placements, rule.subject).every(a => objectsOfType(placements, rule.object).every(b => orthogonalDistance(a, b) !== 1));
  },
  sameRow(rule, placements) {
    return objectsOfType(placements, rule.subject).some(a => objectsOfType(placements, rule.object).some(b => a.row === b.row));
  },
  sameColumn(rule, placements) {
    return objectsOfType(placements, rule.subject).some(a => objectsOfType(placements, rule.object).some(b => a.col === b.col));
  },
  distance(rule, placements) {
    return objectsOfType(placements, rule.subject).some(a => objectsOfType(placements, rule.object).some(b => {
      const distance = orthogonalDistance(a, b);
      return distance >= (rule.min ?? 0) && distance <= (rule.max ?? Infinity);
    }));
  },
  between(rule, placements) {
    const subjects = objectsOfType(placements, rule.subject);
    const objects = objectsOfType(placements, rule.object);
    return subjects.some(subject => objects.some((first, firstIndex) => objects.slice(firstIndex + 1).some(second => {
      const betweenRow = first.row === subject.row && subject.row === second.row && subject.col > Math.min(first.col, second.col) && subject.col < Math.max(first.col, second.col);
      const betweenColumn = first.col === subject.col && subject.col === second.col && subject.row > Math.min(first.row, second.row) && subject.row < Math.max(first.row, second.row);
      return betweenRow || betweenColumn;
    })));
  }
};

function validateRequiredCounts(placements) {
  const counts = placements.reduce((result, item) => {
    result[item.type] = (result[item.type] || 0) + 1;
    return result;
  }, {});
  const missing = Object.entries(currentLevel().requiredCounts).find(([type, count]) => (counts[type] || 0) < count);
  return missing ? `Place every required object before checking. The ${missing[0]} still needs a grid cell.` : null;
}

function checkLayout() {
  const placements = getPlacements();
  const countHint = validateRequiredCounts(placements);
  if (countHint) {
    soundManager.play("wrong");
    feedback.className = "feedback";
    feedback.textContent = countHint;
    return;
  }

  const failedRule = currentLevel().rules.find(rule => !ruleValidators[rule.type](rule, placements));
  if (failedRule) {
    soundManager.play("wrong");
    feedback.className = "feedback";
    feedback.textContent = `Try this: ${failedRule.hint}`;
    return;
  }

  soundManager.play("correct");
  if (currentLevelIndex === levels.length - 1) soundManager.play("victory");
  successText.textContent = currentLevel().successText;
  nextButton.textContent = currentLevelIndex === levels.length - 1 ? "Finish Adventure" : "Next Level";
  showScreen("complete");
}

function resetBoard() {
  [...board.querySelectorAll(".object-tile")].forEach(tile => tileTray.appendChild(tile));
  feedback.textContent = "The board has been reset.";
  feedback.className = "feedback";
  updatePlacedCount();
}

function openHow() {
  howModal.classList.add("active");
  howModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  document.getElementById("closeHowButton").focus();
}

function closeHow() {
  howModal.classList.remove("active");
  howModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  document.getElementById("howButton").focus();
}

document.getElementById("startButton").addEventListener("click", () => loadLevel(0));
document.getElementById("howButton").addEventListener("click", openHow);
document.getElementById("closeHowButton").addEventListener("click", closeHow);
document.getElementById("understoodButton").addEventListener("click", closeHow);
howModal.addEventListener("click", event => { if (event.target === howModal) closeHow(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && howModal.classList.contains("active")) closeHow(); });
document.getElementById("resetButton").addEventListener("click", resetBoard);
document.getElementById("checkButton").addEventListener("click", checkLayout);
nextButton.addEventListener("click", () => {
  if (currentLevelIndex === levels.length - 1) showScreen("ending");
  else {
    soundManager.play("next");
    loadLevel(currentLevelIndex + 1);
  }
});
document.getElementById("playAgainButton").addEventListener("click", () => {
  currentLevelIndex = 0;
  levelLabel.textContent = "Level 1";
  showScreen("start");
});
document.addEventListener("click", event => {
  if (event.target.closest("button")) {
    soundManager.play("button");
  }
});
