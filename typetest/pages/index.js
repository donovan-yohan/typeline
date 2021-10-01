import Head from "next/head";
import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
} from "react";
import ReactTooltip from "react-tooltip";
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
import cleanSeed, { generateSeed } from "../utils/cleanSeed";
import Context from "../components/context";

const DEFAULT_TIME = 30;

export default function Home() {
  const theme = useContext(Context);

  const [timeTotal, setTimeTotal] = useState(DEFAULT_TIME);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [chartStats, setChartStats] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [activeWord, setActiveWord] = useState(0);
  const [textDatabase, setTextDatabase] = useState([[]]);
  const [textTyped, textTypedDispatcher] = useReducer(textTypedReducer, [
    EMPTY_TYPED_DATA,
  ]);

  // initial start up logic
  // {seed: String, time: int}
  const [seed, setSeed] = useState();

  // assign hash on first load
  useEffect(() => {
    let clean = cleanSeed(window.location.hash);
    if (clean.seed === "") clean.seed = generateSeed();
    setSeed(clean);
  }, []);

  // generate new words when hash changes
  useDidUpdateEffect(() => {
    setActiveWord(0);
    setIsRunning(false);
    setFinished(false);
    setTime(0);
    setTimeTotal(seed.time);
    setTextDatabase([[]]);

    window.location.hash = "/" + seed.seed + "/" + seed.time;

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

    setIsResetting(false);
  }, [seed]);

  // when textDatabase changes, reset to original state
  useDidUpdateEffect(() => {}, [textDatabase]);

  const newTest = (seed = generateSeed(), time = DEFAULT_TIME) => {
    setIsResetting(true);
    setSeed({ seed, time });
  };

  const [cursorState, cursorDispatcher] = useReducer(
    cursorReducer,
    initialCursorState
  );
  const [highlightState, highlightDispatcher] = useReducer(
    highlightReducer,
    initialHighlightState
  );
  const [lineOffset, setLineOffset] = useState();

  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    corrected: 0,
  });

  useEffect(() => {
    setStats(
      textTyped.reduce(
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
      )
    );
  }, [textTyped]);

  const paragraphRef = useRef(null);
  const rootRef = useRef(null);
  const textPageRef = useRef(null);
  const textOffset = useOffset(rootRef, textPageRef, [textDatabase]);

  // TYPING LOGIC
  const handleTextTyped = (value, index = activeWord) => {
    textTypedDispatcher({
      type: "updateTextTyped",
      targetIndex: index,
      newValue: value,
    });
  };

  const handleWordChanged = (newActiveWord) => {
    setActiveWord(newActiveWord);
  };

  const handleLineChange = (linePos) => {
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
        correct - lastStat.correctToTime,
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

  // HANDLE INITIAL TEXT TYPED
  useDidUpdateEffect(() => {
    if (!isRunning && textTyped[0].value != "") setIsRunning(true);
  }, [textTyped[0].value]);

  // CUSTOMIZE SETTINGS
  useEffect(() => {
    if (!isRunning) {
      setTime(0);
    }
  }, [time, timeTotal]);

  useEffect(() => {
    setIsRunning(false);
    setTime(0);
  }, [timeTotal]);

  return (
    <div ref={rootRef} className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
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
                  isFinished={finished}
                  isEditing={isEditing}
                  isRunning={isRunning}
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
          {finished && (
            <div className={styles.results}>
              <div className={styles.resultsWrapper}>
                <div className={styles.statsColumn}>
                  <div className={styles.largeScore}>
                    <span
                      className={`label ${styles.largeScoreLabel} ${styles.highlightLabel}`}
                    >
                      <span>WPM</span>
                      <span
                        className={"toolTipIcon"}
                        data-tip
                        data-for='trueWpmTip'
                      >
                        ?
                      </span>
                    </span>
                    <ReactTooltip
                      className={"toolTipWrapper"}
                      id='trueWpmTip'
                      place={"right"}
                      effect={"solid"}
                      backgroundColor={theme.values.tooltipColour}
                      textColor={theme.values.main}
                    >
                      <p>
                        This is your{" "}
                        <span className={styles.highlightLabel}>
                          <b>average words per minute</b>
                        </span>
                        , but lowered for every{" "}
                        <span className={styles.miss}>
                          <b>error</b>
                        </span>{" "}
                        left uncorrected.
                      </p>
                      <p>
                        <code>
                          [correct - (errors - corrected)] / test time
                        </code>
                      </p>
                    </ReactTooltip>
                    <span
                      className={`${styles.largeScoreNumber} ${styles.highlightLabel} ${styles.number}`}
                    >
                      {calculateTrueWPM(
                        stats.correct,
                        stats.incorrect,
                        stats.corrected,
                        0,
                        timeTotal
                      )}
                    </span>
                  </div>

                  <div className={styles.smallScore}>
                    <span className={`label ${styles.smallScoreLabel}`}>
                      <span>Raw WPM</span>
                      <span
                        className={"toolTipIcon"}
                        data-tip
                        data-for='rawWpmTip'
                      >
                        ?
                      </span>
                    </span>
                    <ReactTooltip
                      className={"toolTipWrapper"}
                      id='rawWpmTip'
                      place={"right"}
                      effect={"solid"}
                      backgroundColor={theme.values.tooltipColour}
                      textColor={theme.values.main}
                    >
                      <p>
                        This is your <b>raw average words per minute</b>,
                        calculated using only <b>correct</b> keystrokes.
                      </p>
                      <p>
                        <code>correct / test time</code>
                      </p>
                    </ReactTooltip>
                    <span
                      className={`${styles.smallScoreNumber} ${styles.number}`}
                    >
                      {calculateRawWPM(stats.correct, 0, timeTotal)}
                    </span>
                  </div>
                  <div className={styles.smallScore}>
                    <span
                      className={`label ${styles.smallScoreLabel} ${styles.highlightLabel}`}
                    >
                      Accuracy
                    </span>
                    <span
                      className={`${styles.smallScoreNumber} ${styles.highlightLabel} ${styles.number}`}
                    >
                      {(
                        (stats.correct / (stats.correct + stats.incorrect)) *
                          100 || 0
                      ).toLocaleString("en-US", { maximumFractionDigits: 1 })}
                      %
                    </span>
                  </div>
                  <div className={styles.smallScore}>
                    <span className={`label ${styles.smallScoreLabel}`}>
                      Correct
                    </span>
                    <span
                      className={`${styles.smallScoreNumber} ${styles.number}`}
                    >
                      {stats.correct || 0}
                    </span>
                  </div>
                  <div className={styles.smallScore}>
                    <span
                      className={`label ${styles.smallScoreLabel} ${styles.miss}`}
                    >
                      Errors
                    </span>
                    <span
                      className={`${styles.smallScoreNumber} ${styles.miss} ${styles.number}`}
                    >
                      {stats.incorrect || 0}
                    </span>
                  </div>
                </div>
                <PerformanceChart rawStats={chartStats} />
              </div>
            </div>
          )}

          <Menu
            className={styles.menu}
            isFinished={finished}
            isRunning={isRunning}
            isEditing={isEditing}
            time={time}
            timeTotal={timeTotal}
            onChangeTimeTotal={setTimeTotal}
            onUpdateEditingState={setIsEditing}
            newTest={newTest}
            seed={seed}
          ></Menu>
          {/* DEBUG */}
          {/* <pre>{JSON.stringify({ chartStats }, null, 4)}</pre> */}
        </div>
      </main>
      <style jsx>{``}</style>
    </div>
  );
}
