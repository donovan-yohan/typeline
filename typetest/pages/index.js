import Head from "next/head";
import React, { useState, useEffect, useRef, useReducer } from "react";
import styles from "../styles/Home.module.css";

import Word from "../components/word.js";
import Cursor from "../components/cursor.js";
import Menu from "../components/menu.js";
import PerformanceChart from "../components/performanceChart";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";
import useInterval from "@use-it/interval";
import { calculateRawWPM, calculateTrueWPM } from "../utils/wpmUtils.js";
import createTextDatabase from "../utils/createTextDatabase.js";
import { useOffset } from "../hooks/useOffset.js";
import {
  cursorReducer,
  initialCursorState,
  highlightReducer,
  initialHighlightState,
  textTypedReducer,
  EMPTY_TYPED_DATA,
} from "../components/reducers";
import cleanSeed from "../utils/cleanSeed";

export default function Home() {
  // initial start up logic
  // {seed: String, time: int}
  const [seed, setSeed] = useState();

  // assign hash on first load
  useEffect(() => {
    let clean = cleanSeed(window.location.hash);
    if (clean.seed === "") clean.seed = (Math.random() + 1).toString(36).substring(2).replace(/[0-9]+/g, "")
    window.location.hash = "/" + clean.seed + "/" + clean.time;
    setSeed(clean);
  }, []);

  // generate new words when hash changes
  useEffect(() => {
    (async () => {
      const res = await fetch("/api/words", {
        method: "POST",
        body: JSON.stringify({ ...seed }),
      });
      const json = await res.json();

      let newTextDatabase = createTextDatabase(json.words);
      setTextDatabase(newTextDatabase);
      textTypedDispatcher({ type: "setTextTyped", textData: newTextDatabase });
    })();
  }, [seed]);

  const [activeWord, setActiveWord] = useState(0);
  const [textDatabase, setTextDatabase] = useState([[]]);
  const [textTyped, textTypedDispatcher] = useReducer(textTypedReducer, [
    EMPTY_TYPED_DATA,
  ]);

  const [cursorState, cursorDispatcher] = useReducer(
    cursorReducer,
    initialCursorState
  );
  const [highlightState, highlightDispatcher] = useReducer(
    highlightReducer,
    initialHighlightState
  );
  const [lineOffset, setLineOffset] = useState();

  const stats = textTyped.reduce(
    (acc, word, i) => {
      if (!word.stats) return acc;
      acc.correct += word.stats?.correct;
      acc.incorrect += word.stats?.incorrect;
      acc.corrected += word.stats?.corrected;
      return acc;
    },
    {
      correct: 0,
      incorrect: 0,
      corrected: 0,
    }
  );

  const [timeTotal, setTimeTotal] = useState(30);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [chartStats, setChartStats] = useState([]);

  const paragraphRef = useRef(null);
  const rootRef = useRef(null);
  const textPageRef = useRef(null);
  const textOffset = useOffset(rootRef, textPageRef);

  // TYPING LOGIC
  const handleTextTyped = (value, index = activeWord) => {
    textTypedDispatcher({
      type: "updateTextTyped",
      targetIndex: index,
      newValue: value,
    });
  };

  const handleUpdateStats = (stats, index = activeWord) => {
    updateTextTypedArray(index, {
      value: textTyped[index].value,
      stats: stats,
      visited: textTyped[index].visited,
    });
  };

  const handleWordChanged = (newActiveWord) => {
    setActiveWord(newActiveWord);
  };

  const handleLineChange = (linePos) => {
    // TODO: Figure out where this small amount of displacement comes from?
    if (linePos.bottom > window.innerHeight / 2 - textOffset.top + 6.5) {
      setLineOffset(
        window.innerHeight / 2 - textOffset.top - linePos.bottom + 6.5
      );
    }
  };

  // helper function to find change in values over time for graph
  const newStat = (lastStat, currentTime, correct, incorrect) => {
    return {
      wpm: calculateTrueWPM(
        stats.correct,
        stats.incorrect,
        stats.corrected,
        timeTotal - time,
        timeTotal
      ),
      raw: calculateRawWPM(
        correct - lastStat.correctToTime + incorrect - lastStat.incorrectToTime,
        lastStat.time,
        currentTime
      ),
      rawAverage: calculateRawWPM(correct, 0, currentTime),
      correctInInterval: correct - lastStat.correctToTime,
      incorrectInInterval: incorrect - lastStat.incorrectToTime,
      time: currentTime,
      correctToTime: correct,
      incorrectToTime: incorrect,
    };
  };

  // COUNTER
  useInterval(
    () => {
      setTime((time) => time + 1);
    },
    isRunning ? 1000 : null
  );

  useEffect(() => {
    // update stats for graph/chart
    if (time == 1) {
      setChartStats([
        newStat(
          {
            wpm: 0,
            raw: 0,
            rawAverage: 0,
            correctInInterval: 0,
            incorrectInInterval: 0,
            time: 0,
            correctToTime: 0,
            incorrectToTime: 0,
          },
          time,
          stats.correct,
          stats.incorrect
        ),
      ]);
    } else if (time > 1) {
      setChartStats([
        ...chartStats,
        newStat(chartStats[time - 2], time, stats.correct, stats.incorrect),
      ]);
    }

    // end test
    if (time >= timeTotal) {
      setIsRunning(false);
      setFinished(true);
      setTime(timeTotal);
    }
  }, [time]);

  // HANDLE TEXT TYPED
  useDidUpdateEffect(() => {
    if (!isRunning) setIsRunning(true);
  }, [textTyped[0].value]);

  // CUSTOMIZE SETTINGS
  useEffect(() => {
    if (!isRunning) {
      setTime(0);
    }
  }, [time, timeTotal]);

  return (
    <div ref={rootRef} className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        {finished && (
          <div className={styles.wpmColumn}>
            <div className={styles.largeScore}>
              <span className={styles.largeScoreLabel}>True WPM</span>
              <span className={styles.largeScoreNumber}>
                {calculateTrueWPM(
                  stats.correct,
                  stats.incorrect,
                  stats.corrected,
                  0,
                  timeTotal
                )}
              </span>
            </div>
            <div className={styles.smallScoreWrapper}>
              <div className={styles.smallScore}>
                <span className={styles.smallScoreLabel}>Raw WPM</span>
                <span className={styles.smallWPMNumber}>
                  {calculateRawWPM(stats.correct, 0, timeTotal)}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className={styles.textColumn}>
          {!finished && (
            <div
              ref={textPageRef}
              className={styles.textPage}
              key={textDatabase.toLocaleString()}
            >
              <div
                ref={paragraphRef}
                className={styles.textFrame}
                style={{ transform: `translateY(${lineOffset}px)` }}
              >
                <Cursor
                  onTextTyped={handleTextTyped}
                  onWordChanged={handleWordChanged}
                  wordRef={highlightState.wordRef}
                  letterRef={cursorState.letterRef}
                  paragraphRef={paragraphRef}
                  activeWord={activeWord}
                  textTyped={textTyped}
                  textDatabase={textDatabase}
                  finished={finished}
                  isFirstChar={cursorState.isFirstChar}
                  onLineChange={handleLineChange}
                />
                <div className={styles.textWrapper}>
                  {textDatabase.map((word, i) => {
                    return (
                      <Word
                        id={i}
                        word={word}
                        active={activeWord == i}
                        typed={textTyped[i] || EMPTY_TYPED_DATA}
                        key={`WORD-${i}`}
                        onLetterUpdate={cursorDispatcher}
                        onWordUpdate={highlightDispatcher}
                        finished={finished}
                        onUpdateStats={textTypedDispatcher}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {finished && <PerformanceChart rawStats={chartStats} />}

          <Menu
            className={styles.menu}
            isFinished={finished}
            isRunning={isRunning}
            time={time}
            timeTotal={timeTotal}
            onChangeTimeTotal={setTimeTotal}
          ></Menu>
          {/* DEBUG */}
          {/* <pre>{JSON.stringify({ chartStats }, null, 4)}</pre> */}
        </div>
        {finished && (
          <div className={styles.streakColumn}>
            <div className={styles.largeScore}>
              <span className={styles.largeScoreLabel}>Accuracy</span>
              <span className={styles.largeScoreNumber}>
                {(
                  (stats.correct / (stats.correct + stats.incorrect)) * 100 || 0
                ).toLocaleString("en-US", { maximumFractionDigits: 1 })}
                %
              </span>
            </div>
            <div className={styles.smallScoreWrapper}>
              <div className={styles.smallScore}>
                <span className={styles.smallScoreLabel}>Correct</span>
                <span className={styles.smallScoreNumber}>
                  {stats.correct || 0}
                </span>
              </div>
              <div className={styles.smallScore}>
                <span className={styles.smallScoreLabel}>Errors</span>
                <span className={`${styles.smallScoreNumber} ${styles.miss}`}>
                  {stats.incorrect || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </main>
      <style jsx>{``}</style>
    </div>
  );
}
