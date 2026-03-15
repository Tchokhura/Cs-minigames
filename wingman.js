const allMaps = [
  { name: "Inferno", image: "images/Inferno.png", enabled: true },
  { name: "Nuke", image: "images/Nuke.png", enabled: true },
  { name: "Vertigo", image: "images/Vertigo.png", enabled: true },
  { name: "Overpass", image: "images/Overpass.png", enabled: true },
  { name: "Sanktom", image: "images/Sanktom.png", enabled: true },
  { name: "Poseidon", image: "images/Poseidon.png", enabled: true },
];

let currentMode = "random";
let remainingMaps = [];
let removedMaps = [];
let currentSelectedMap = null;
let isSpinning = false;

let isSoundEnabled = JSON.parse(
  localStorage.getItem("cs2SoundEnabled") ?? "true",
);

let isAnimationEnabled = JSON.parse(
  localStorage.getItem("cs2AnimationEnabled") ?? "true",
);

const randomModeBtn = document.getElementById("randomModeBtn");
const eliminationModeBtn = document.getElementById("eliminationModeBtn");
const spinBtn = document.getElementById("spinBtn");
const resetBtn = document.getElementById("resetBtn");
const toggleSoundBtn = document.getElementById("toggleSoundBtn");
const toggleAnimationBtn = document.getElementById("toggleAnimationBtn");
const selectAllBtn = document.getElementById("selectAllBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const resultCard = document.getElementById("resultCard");
const resultImage = document.getElementById("resultImage");
const resultName = document.getElementById("resultName");
const resultText = document.getElementById("resultText");
const mapsGrid = document.getElementById("mapsGrid");
const currentModeText = document.getElementById("currentModeText");
const remainingCount = document.getElementById("remainingCount");
const lastRemoved = document.getElementById("lastRemoved");
const selectedCount = document.getElementById("selectedCount");

/* ---------------- AUDIO ---------------- */

const spinSound = new Audio("sounds/spin.mp3");
const finalSound = new Audio("sounds/final.mp3");

spinSound.preload = "auto";
finalSound.preload = "auto";

spinSound.volume = 0.35;
finalSound.volume = 0.45;

function stopAudio(audio) {
  audio.pause();
  audio.currentTime = 0;
}

function playAudio(audio) {
  if (!isSoundEnabled) return;

  try {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (error) {
    console.log("Audio play blocked:", error);
  }
}

function updateSoundButton() {
  toggleSoundBtn.textContent = isSoundEnabled ? "Sound: On" : "Sound: Off";
  toggleSoundBtn.classList.toggle("sound-off", !isSoundEnabled);
}

function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  localStorage.setItem("cs2SoundEnabled", JSON.stringify(isSoundEnabled));

  if (!isSoundEnabled) {
    stopAudio(spinSound);
    stopAudio(finalSound);
  }

  updateSoundButton();
}

/* ---------------- ANIMATION ---------------- */

function updateAnimationButton() {
  toggleAnimationBtn.textContent = isAnimationEnabled
    ? "Animation: On"
    : "Animation: Off";
  toggleAnimationBtn.classList.toggle("animation-off", !isAnimationEnabled);
}

function toggleAnimation() {
  if (isSpinning) return;

  isAnimationEnabled = !isAnimationEnabled;
  localStorage.setItem(
    "cs2AnimationEnabled",
    JSON.stringify(isAnimationEnabled),
  );

  resultCard.classList.remove("spinning", "final-reveal");
  updateAnimationButton();
}

/* ---------------- UI / LOGIC ---------------- */

function getEnabledMaps() {
  return allMaps.filter((map) => map.enabled);
}

function updateSelectedCount() {
  selectedCount.textContent = getEnabledMaps().length;
}

function updateInfo() {
  currentModeText.textContent =
    currentMode === "random" ? "Random Spin" : "Elimination Mode";

  remainingCount.textContent = remainingMaps.length;
  lastRemoved.textContent =
    removedMaps.length > 0 ? removedMaps[removedMaps.length - 1].name : "None";
}

function getToggleInputs() {
  return document.querySelectorAll('.include-toggle input[type="checkbox"]');
}

function setControlsDisabled(disabled) {
  isSpinning = disabled;

  spinBtn.disabled = disabled;
  resetBtn.disabled = disabled;
  toggleSoundBtn.disabled = disabled;
  toggleAnimationBtn.disabled = disabled;
  randomModeBtn.disabled = disabled;
  eliminationModeBtn.disabled = disabled;
  selectAllBtn.disabled = disabled;
  clearAllBtn.disabled = disabled;

  getToggleInputs().forEach((checkbox) => {
    checkbox.disabled = disabled;
  });
}

function showMapInResult(map, text) {
  resultImage.src = map.image;
  resultImage.alt = map.name;
  resultName.textContent = map.name;
  resultText.textContent = text;
}

function resetGame() {
  if (isSpinning) return;

  stopAudio(spinSound);
  stopAudio(finalSound);

  remainingMaps = [...getEnabledMaps()];
  removedMaps = [];
  currentSelectedMap = null;

  if (remainingMaps.length > 0) {
    resultImage.src = remainingMaps[0].image;
    resultImage.alt = remainingMaps[0].name;
  } else {
    resultImage.src = "images/Inferno.png";
    resultImage.alt = "Map preview";
  }

  resultName.textContent = "Press Spin";
  resultText.textContent =
    currentMode === "random"
      ? "A random Wingman map will appear here."
      : "Each spin removes one map until only one remains.";

  resultCard.classList.remove("spinning", "final-reveal");

  updateInfo();
  updateSelectedCount();
  renderMaps();
}

function setMode(mode) {
  if (isSpinning) return;

  currentMode = mode;
  randomModeBtn.classList.toggle("active", mode === "random");
  eliminationModeBtn.classList.toggle("active", mode === "elimination");
  resetGame();
}

function getRandomMapFromList(list) {
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

function getRandomMapFromRemaining() {
  return getRandomMapFromList(remainingMaps);
}

function flashSelectedCard() {
  const cards = document.querySelectorAll(".map-card");
  cards.forEach((card) => card.classList.remove("flash-selected"));

  const selectedCard = [...cards].find((card) => {
    const title = card.querySelector("h4");
    return (
      title &&
      currentSelectedMap &&
      title.textContent === currentSelectedMap.name
    );
  });

  if (selectedCard) {
    selectedCard.classList.add("flash-selected");
    setTimeout(() => {
      selectedCard.classList.remove("flash-selected");
    }, 700);
  }
}

function renderMaps() {
  mapsGrid.innerHTML = "";

  allMaps.forEach((map) => {
    const isRemaining = remainingMaps.some((m) => m.name === map.name);
    const isSelected =
      currentSelectedMap && currentSelectedMap.name === map.name;

    const card = document.createElement("div");
    card.className = "map-card";

    if (!map.enabled) {
      card.classList.add("disabled-map");
    }

    if (!isRemaining && currentMode === "elimination" && map.enabled) {
      card.classList.add("removed");
    }

    if (isSelected) {
      card.classList.add("selected");
    }

    card.innerHTML = `
      <div class="map-topbar">
        <label class="include-toggle">
          <input
            type="checkbox"
            data-map-name="${map.name}"
            ${map.enabled ? "checked" : ""}
          >
          <span class="toggle-ui">
            <span class="toggle-knob"></span>
          </span>
          <span class="toggle-text">${map.enabled ? "Included" : "Excluded"}</span>
        </label>
      </div>

      <img src="${map.image}" alt="${map.name}">
      <div class="map-card-content">
        <h4>${map.name}</h4>
        <p>${!map.enabled ? "Excluded" : isRemaining ? "Available" : "Removed"}</p>
      </div>
    `;

    mapsGrid.appendChild(card);
  });

  getToggleInputs().forEach((checkbox) => {
    checkbox.addEventListener("change", handleMapToggle);
    checkbox.disabled = isSpinning;
  });
}

function handleMapToggle(event) {
  if (isSpinning) return;

  const mapName = event.target.dataset.mapName;
  const enabledMaps = getEnabledMaps();
  const map = allMaps.find((m) => m.name === mapName);

  if (!map) return;

  if (!event.target.checked && enabledMaps.length === 1) {
    event.target.checked = true;
    alert("At least one map must remain selected.");
    return;
  }

  map.enabled = event.target.checked;
  resetGame();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function animateSpin(candidateMaps, finalMap, finalText) {
  if (!isAnimationEnabled) {
    showMapInResult(finalMap, finalText);
    resultCard.classList.remove("spinning");
    resultCard.classList.add("final-reveal");

    playAudio(spinSound);
    playAudio(finalSound);

    setTimeout(() => {
      resultCard.classList.remove("final-reveal");
    }, 350);

    return;
  }

  setControlsDisabled(true);

  stopAudio(spinSound);
  playAudio(spinSound);

  resultCard.classList.remove("final-reveal");
  resultCard.classList.add("spinning");

  const animationSequence = [];
  const totalSteps = 12;

  for (let i = 0; i < totalSteps; i++) {
    animationSequence.push(getRandomMapFromList(candidateMaps));
  }

  animationSequence.push(finalMap);

  for (let i = 0; i < animationSequence.length; i++) {
    const map = animationSequence[i];
    const isLast = i === animationSequence.length - 1;

    resultImage.src = map.image;
    resultImage.alt = map.name;
    resultName.textContent = map.name;
    resultText.textContent = isLast ? finalText : "Spinning...";

    let delay = 70;

    if (i > 6) delay = 110;
    if (i > 9) delay = 160;
    if (i > 10) delay = 220;
    if (isLast) delay = 260;

    await sleep(delay);
  }

  stopAudio(spinSound);

  resultCard.classList.remove("spinning");
  resultCard.classList.add("final-reveal");

  setTimeout(() => {
    resultCard.classList.remove("final-reveal");
  }, 550);

  playAudio(finalSound);

  setControlsDisabled(false);
}

async function spinRandomMode() {
  if (remainingMaps.length === 0) {
    alert("Please select at least one map first.");
    return;
  }

  if (isSpinning) return;

  const chosenMap = getRandomMapFromRemaining();

  await animateSpin(remainingMaps, chosenMap, "Selected map for this round.");

  currentSelectedMap = chosenMap;
  renderMaps();
  updateInfo();
  flashSelectedCard();
}

async function spinEliminationMode() {
  if (remainingMaps.length === 0) {
    alert("Please select at least one map first.");
    return;
  }

  if (isSpinning) return;

  if (remainingMaps.length > 1) {
    const chosenMap = getRandomMapFromRemaining();

    if (!isAnimationEnabled) {
      removedMaps.push(chosenMap);
      remainingMaps = remainingMaps.filter(
        (map) => map.name !== chosenMap.name,
      );
      currentSelectedMap = chosenMap;

      if (remainingMaps.length === 1) {
        const finalMap = remainingMaps[0];
        currentSelectedMap = finalMap;
        showMapInResult(finalMap, "Final map! This is the last remaining map.");
        playAudio(spinSound);
        playAudio(finalSound);
      } else {
        showMapInResult(
          chosenMap,
          `${chosenMap.name} has been removed. ${remainingMaps.length} map(s) remaining.`,
        );
        playAudio(spinSound);
        playAudio(finalSound);
      }

      resultCard.classList.remove("spinning");
      resultCard.classList.add("final-reveal");

      setTimeout(() => {
        resultCard.classList.remove("final-reveal");
      }, 350);

      renderMaps();
      updateInfo();
      flashSelectedCard();
      return;
    }

    await animateSpin(
      remainingMaps,
      chosenMap,
      `Removing ${chosenMap.name}...`,
    );

    removedMaps.push(chosenMap);
    remainingMaps = remainingMaps.filter((map) => map.name !== chosenMap.name);
    currentSelectedMap = chosenMap;

    if (remainingMaps.length === 1) {
      const finalMap = remainingMaps[0];

      await sleep(250);

      setControlsDisabled(true);
      resultCard.classList.add("spinning");
      playAudio(spinSound);

      await sleep(350);

      stopAudio(spinSound);
      resultCard.classList.remove("spinning");
      showMapInResult(finalMap, "Final map! This is the last remaining map.");
      resultCard.classList.add("final-reveal");

      setTimeout(() => {
        resultCard.classList.remove("final-reveal");
      }, 550);

      playAudio(finalSound);

      currentSelectedMap = finalMap;
      setControlsDisabled(false);
    } else {
      showMapInResult(
        chosenMap,
        `${chosenMap.name} has been removed. ${remainingMaps.length} map(s) remaining.`,
      );
    }

    renderMaps();
    updateInfo();
    flashSelectedCard();
    return;
  }

  if (remainingMaps.length === 1) {
    const finalMap = remainingMaps[0];
    currentSelectedMap = finalMap;
    showMapInResult(
      finalMap,
      "Final map already selected. Press Reset to start again.",
    );
    playAudio(finalSound);
    renderMaps();
    updateInfo();
    flashSelectedCard();
  }
}

function selectAllMaps() {
  if (isSpinning) return;

  allMaps.forEach((map) => {
    map.enabled = true;
  });

  resetGame();
}

function clearAllMaps() {
  if (isSpinning) return;

  allMaps.forEach((map) => {
    map.enabled = false;
  });

  allMaps[0].enabled = true;
  resetGame();
}

randomModeBtn.addEventListener("click", () => setMode("random"));
eliminationModeBtn.addEventListener("click", () => setMode("elimination"));

spinBtn.addEventListener("click", async () => {
  if (currentMode === "random") {
    await spinRandomMode();
  } else {
    await spinEliminationMode();
  }
});

resetBtn.addEventListener("click", resetGame);
toggleSoundBtn.addEventListener("click", toggleSound);
toggleAnimationBtn.addEventListener("click", toggleAnimation);
selectAllBtn.addEventListener("click", selectAllMaps);
clearAllBtn.addEventListener("click", clearAllMaps);

updateSoundButton();
updateAnimationButton();
resetGame();
