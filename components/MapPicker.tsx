"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import type { MapItem } from "@/lib/maps";

type MapPickerProps = {
  pageTitle: string;
  heading: string;
  description: string;
  maps: MapItem[];
  fallbackImage: string;
  initialRemainingCount: number;
  availableTitle: string;
  availableDescription: string;
  randomResultText: string;
  eliminationResultText: string;
  selectedRoundText: string;
  resultAlt: string;
};

type Mode = "random" | "elimination";

export default function MapPicker({
  heading,
  description,
  maps,
  fallbackImage,
  availableTitle,
  availableDescription,
  randomResultText,
  eliminationResultText,
  selectedRoundText,
  resultAlt,
}: MapPickerProps) {
  const [allMaps, setAllMaps] = useState<MapItem[]>(
    maps.map((m) => ({ ...m })),
  );
  const [currentMode, setCurrentMode] = useState<Mode>("random");
  const [remainingMaps, setRemainingMaps] = useState<MapItem[]>([]);
  const [removedMaps, setRemovedMaps] = useState<MapItem[]>([]);
  const [currentSelectedMap, setCurrentSelectedMap] = useState<MapItem | null>(
    null,
  );
  const [isSpinning, setIsSpinning] = useState(false);

  const [resultImage, setResultImage] = useState(fallbackImage);
  const [resultImageAlt, setResultImageAlt] = useState("Map preview");
  const [resultName, setResultName] = useState("Press Spin");
  const [resultText, setResultText] = useState(
    "The selected map will appear here.",
  );
  const [isResultSpinning, setIsResultSpinning] = useState(false);
  const [isFinalReveal, setIsFinalReveal] = useState(false);

  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const [flashMapName, setFlashMapName] = useState<string | null>(null);

  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const finalSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedSound = JSON.parse(
      localStorage.getItem("cs2SoundEnabled") ?? "true",
    );
    const savedAnimation = JSON.parse(
      localStorage.getItem("cs2AnimationEnabled") ?? "true",
    );

    setIsSoundEnabled(savedSound);
    setIsAnimationEnabled(savedAnimation);

    spinSoundRef.current = new Audio("/sounds/spin.mp3");
    finalSoundRef.current = new Audio("/sounds/final.mp3");

    if (spinSoundRef.current) {
      spinSoundRef.current.preload = "auto";
      spinSoundRef.current.volume = 0.35;
    }

    if (finalSoundRef.current) {
      finalSoundRef.current.preload = "auto";
      finalSoundRef.current.volume = 0.45;
    }
  }, []);

  const enabledMaps = useMemo(() => {
    return allMaps.filter((map) => map.enabled);
  }, [allMaps]);

  const selectedCount = enabledMaps.length;

  const stopAudio = (audio: HTMLAudioElement | null) => {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  };

  const playAudio = (audio: HTMLAudioElement | null) => {
    if (!audio || !isSoundEnabled) return;

    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  };

  const showMapInResult = (map: MapItem, text: string) => {
    setResultImage(map.image);
    setResultImageAlt(map.name);
    setResultName(map.name);
    setResultText(text);
  };

  const sleep = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });

  const getRandomMapFromList = (list: MapItem[]) => {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
  };

  const resetGame = (
    mode: Mode = currentMode,
    mapsState: MapItem[] = allMaps,
  ) => {
    if (isSpinning) return;

    stopAudio(spinSoundRef.current);
    stopAudio(finalSoundRef.current);

    const enabled = mapsState.filter((map) => map.enabled);

    setRemainingMaps([...enabled]);
    setRemovedMaps([]);
    setCurrentSelectedMap(null);
    setFlashMapName(null);

    if (enabled.length > 0) {
      setResultImage(enabled[0].image);
      setResultImageAlt(enabled[0].name);
    } else {
      setResultImage(fallbackImage);
      setResultImageAlt("Map preview");
    }

    setResultName("Press Spin");
    setResultText(mode === "random" ? randomResultText : eliminationResultText);
    setIsResultSpinning(false);
    setIsFinalReveal(false);
  };

  useEffect(() => {
    resetGame(
      "random",
      maps.map((m) => ({ ...m })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerFinalReveal = (duration = 550) => {
    setIsFinalReveal(true);
    setTimeout(() => {
      setIsFinalReveal(false);
    }, duration);
  };

  const flashSelectedCard = (mapName: string) => {
    setFlashMapName(mapName);
    setTimeout(() => {
      setFlashMapName(null);
    }, 700);
  };

  const toggleSound = () => {
    const next = !isSoundEnabled;
    setIsSoundEnabled(next);
    localStorage.setItem("cs2SoundEnabled", JSON.stringify(next));

    if (!next) {
      stopAudio(spinSoundRef.current);
      stopAudio(finalSoundRef.current);
    }
  };

  const toggleAnimation = () => {
    if (isSpinning) return;

    const next = !isAnimationEnabled;
    setIsAnimationEnabled(next);
    localStorage.setItem("cs2AnimationEnabled", JSON.stringify(next));
    setIsResultSpinning(false);
    setIsFinalReveal(false);
  };

  const setMode = (mode: Mode) => {
    if (isSpinning) return;
    setCurrentMode(mode);
    resetGame(mode);
  };

  const handleMapToggle = (mapName: string, checked: boolean) => {
    if (isSpinning) return;

    const currentEnabled = allMaps.filter((map) => map.enabled);
    if (!checked && currentEnabled.length === 1) {
      alert("At least one map must remain selected.");
      return;
    }

    const nextMaps = allMaps.map((map) =>
      map.name === mapName ? { ...map, enabled: checked } : map,
    );

    setAllMaps(nextMaps);
    resetGame(currentMode, nextMaps);
  };

  const selectAllMaps = () => {
    if (isSpinning) return;

    const nextMaps = allMaps.map((map) => ({ ...map, enabled: true }));
    setAllMaps(nextMaps);
    resetGame(currentMode, nextMaps);
  };

  const clearAllMaps = () => {
    if (isSpinning) return;

    const nextMaps = allMaps.map((map, index) => ({
      ...map,
      enabled: index === 0,
    }));

    setAllMaps(nextMaps);
    resetGame(currentMode, nextMaps);
  };

  const animateSpin = async (
    candidateMaps: MapItem[],
    finalMap: MapItem,
    finalText: string,
  ) => {
    if (!isAnimationEnabled) {
      showMapInResult(finalMap, finalText);
      setIsResultSpinning(false);
      triggerFinalReveal(350);
      playAudio(spinSoundRef.current);
      playAudio(finalSoundRef.current);
      return;
    }

    setIsSpinning(true);

    stopAudio(spinSoundRef.current);
    playAudio(spinSoundRef.current);

    setIsFinalReveal(false);
    setIsResultSpinning(true);

    const animationSequence: MapItem[] = [];
    const totalSteps = candidateMaps.length > 10 ? 14 : 12;

    for (let i = 0; i < totalSteps; i++) {
      animationSequence.push(getRandomMapFromList(candidateMaps));
    }

    animationSequence.push(finalMap);

    for (let i = 0; i < animationSequence.length; i++) {
      const map = animationSequence[i];
      const isLast = i === animationSequence.length - 1;

      setResultImage(map.image);
      setResultImageAlt(map.name);
      setResultName(map.name);
      setResultText(isLast ? finalText : "Spinning...");

      let delay = 70;

      if (i > 6) delay = 110;
      if (i > 9) delay = 160;
      if (i > 10) delay = 220;
      if (isLast) delay = 260;

      await sleep(delay);
    }

    stopAudio(spinSoundRef.current);

    setIsResultSpinning(false);
    triggerFinalReveal(550);
    playAudio(finalSoundRef.current);

    setIsSpinning(false);
  };

  const spinRandomMode = async () => {
    if (remainingMaps.length === 0) {
      alert("Please select at least one map first.");
      return;
    }

    if (isSpinning) return;

    const chosenMap = getRandomMapFromList(remainingMaps);

    await animateSpin(remainingMaps, chosenMap, selectedRoundText);

    setCurrentSelectedMap(chosenMap);
    flashSelectedCard(chosenMap.name);
  };

  const spinEliminationMode = async () => {
    if (remainingMaps.length === 0) {
      alert("Please select at least one map first.");
      return;
    }

    if (isSpinning) return;

    if (remainingMaps.length > 1) {
      const chosenMap = getRandomMapFromList(remainingMaps);

      if (!isAnimationEnabled) {
        const nextRemoved = [...removedMaps, chosenMap];
        const nextRemaining = remainingMaps.filter(
          (map) => map.name !== chosenMap.name,
        );

        setRemovedMaps(nextRemoved);
        setRemainingMaps(nextRemaining);
        setCurrentSelectedMap(chosenMap);

        if (nextRemaining.length === 1) {
          const finalMap = nextRemaining[0];
          setCurrentSelectedMap(finalMap);
          showMapInResult(
            finalMap,
            "Final map! This is the last remaining map.",
          );
          playAudio(spinSoundRef.current);
          playAudio(finalSoundRef.current);
          flashSelectedCard(finalMap.name);
        } else {
          showMapInResult(
            chosenMap,
            `${chosenMap.name} has been removed. ${nextRemaining.length} map(s) remaining.`,
          );
          playAudio(spinSoundRef.current);
          playAudio(finalSoundRef.current);
          flashSelectedCard(chosenMap.name);
        }

        setIsResultSpinning(false);
        triggerFinalReveal(350);
        return;
      }

      await animateSpin(
        remainingMaps,
        chosenMap,
        `Removing ${chosenMap.name}...`,
      );

      const nextRemoved = [...removedMaps, chosenMap];
      const nextRemaining = remainingMaps.filter(
        (map) => map.name !== chosenMap.name,
      );

      setRemovedMaps(nextRemoved);
      setRemainingMaps(nextRemaining);
      setCurrentSelectedMap(chosenMap);

      if (nextRemaining.length === 1) {
        const finalMap = nextRemaining[0];

        await sleep(250);

        setIsSpinning(true);
        setIsResultSpinning(true);
        playAudio(spinSoundRef.current);

        await sleep(350);

        stopAudio(spinSoundRef.current);
        setIsResultSpinning(false);
        showMapInResult(finalMap, "Final map! This is the last remaining map.");
        triggerFinalReveal(550);
        playAudio(finalSoundRef.current);

        setCurrentSelectedMap(finalMap);
        setIsSpinning(false);
        flashSelectedCard(finalMap.name);
      } else {
        showMapInResult(
          chosenMap,
          `${chosenMap.name} has been removed. ${nextRemaining.length} map(s) remaining.`,
        );
        flashSelectedCard(chosenMap.name);
      }

      return;
    }

    if (remainingMaps.length === 1) {
      const finalMap = remainingMaps[0];
      setCurrentSelectedMap(finalMap);
      showMapInResult(
        finalMap,
        "Final map already selected. Press Reset to start again.",
      );
      playAudio(finalSoundRef.current);
      flashSelectedCard(finalMap.name);
    }
  };

  const remainingCount = remainingMaps.length;
  const lastRemoved =
    removedMaps.length > 0 ? removedMaps[removedMaps.length - 1].name : "None";

  return (
    <>
      <div className="background-overlay"></div>

      <main className="container">
        <header className="topbar">
          <Link href="/" className="topbar-brand">
            CS2 Picker
          </Link>

          <div className="topbar-actions">
            <Link href="/" className="back-link topbar-back">
              ← Modes
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <header className="hero">
          <h1>{heading}</h1>
          <p>{description}</p>
        </header>

        <section className="mode-switch">
          <button
            className={`mode-btn ${currentMode === "random" ? "active" : ""}`}
            onClick={() => setMode("random")}
            disabled={isSpinning}
          >
            Random Spin
          </button>
          <button
            className={`mode-btn ${currentMode === "elimination" ? "active" : ""}`}
            onClick={() => setMode("elimination")}
            disabled={isSpinning}
          >
            Elimination Mode
          </button>
        </section>

        <section className="spinner-section">
          <div className="spinner-box">
            <p className="spinner-label">Current Result</p>

            <div
              className={`result-card ${isResultSpinning ? "spinning" : ""} ${
                isFinalReveal ? "final-reveal" : ""
              }`}
            >
              <img src={resultImage} alt={resultImageAlt || resultAlt} />
              <h2>{resultName}</h2>
              <p>{resultText}</p>
            </div>

            <div className="actions">
              <button
                className="primary-btn"
                onClick={() =>
                  currentMode === "random"
                    ? spinRandomMode()
                    : spinEliminationMode()
                }
                disabled={isSpinning}
              >
                Spin
              </button>

              <button
                className="secondary-btn"
                onClick={() => resetGame()}
                disabled={isSpinning}
              >
                Reset
              </button>

              <button
                className={`secondary-btn ${!isSoundEnabled ? "sound-off" : ""}`}
                onClick={toggleSound}
                disabled={isSpinning}
              >
                {isSoundEnabled ? "Sound: On" : "Sound: Off"}
              </button>

              <button
                className={`secondary-btn ${!isAnimationEnabled ? "animation-off" : ""}`}
                onClick={toggleAnimation}
                disabled={isSpinning}
              >
                {isAnimationEnabled ? "Animation: On" : "Animation: Off"}
              </button>
            </div>
          </div>

          <div className="info-box">
            <h3>Game Info</h3>
            <p>
              <strong>Mode:</strong>{" "}
              <span>
                {currentMode === "random" ? "Random Spin" : "Elimination Mode"}
              </span>
            </p>
            <p>
              <strong>Remaining Maps:</strong> <span>{remainingCount}</span>
            </p>
            <p>
              <strong>Last Removed:</strong> <span>{lastRemoved}</span>
            </p>
          </div>
        </section>

        <section className="maps-section">
          <div className="section-header">
            <div>
              <h2>{availableTitle}</h2>
              <p>{availableDescription}</p>
            </div>

            <div className="selection-actions">
              <button
                className="secondary-btn small-btn"
                onClick={selectAllMaps}
                disabled={isSpinning}
              >
                Select All
              </button>
              <button
                className="secondary-btn small-btn"
                onClick={clearAllMaps}
                disabled={isSpinning}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="selection-info">
            <p>
              <strong>Selected Maps:</strong> <span>{selectedCount}</span>
            </p>
          </div>

          <div className="maps-grid">
            {allMaps.map((map) => {
              const isRemaining = remainingMaps.some(
                (m) => m.name === map.name,
              );
              const isSelected = currentSelectedMap?.name === map.name;

              return (
                <div
                  key={map.name}
                  className={`map-card
                    ${!map.enabled ? "disabled-map" : ""}
                    ${!isRemaining && currentMode === "elimination" && map.enabled ? "removed" : ""}
                    ${isSelected ? "selected" : ""}
                    ${flashMapName === map.name ? "flash-selected" : ""}
                  `}
                >
                  <div className="map-topbar">
                    <label className="include-toggle">
                      <input
                        type="checkbox"
                        checked={map.enabled}
                        onChange={(e) =>
                          handleMapToggle(map.name, e.target.checked)
                        }
                        disabled={isSpinning}
                      />
                      <span className="toggle-ui">
                        <span className="toggle-knob"></span>
                      </span>
                      <span className="toggle-text">
                        {map.enabled ? "Included" : "Excluded"}
                      </span>
                    </label>
                  </div>

                  <img src={map.image} alt={map.name} />

                  <div className="map-card-content">
                    <h4>{map.name}</h4>
                    <p>
                      {!map.enabled
                        ? "Excluded"
                        : isRemaining
                          ? "Available"
                          : "Removed"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}
