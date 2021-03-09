import Head from "next/head";
import React, { useState, useEffect, useRef, useReducer } from "react";
import styles from "../styles/Home.module.css";

import Word from "../components/word.js";
import Cursor from "../components/cursor.js";
import Menu from "../components/menu.js";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";
import useInterval from "@use-it/interval";
import generateWords from "../utils/generateWords.js";
import createTextDatabase from "../utils/createTextDatabase.js";
import { useOffset } from "../hooks/useOffset.js";
import {
  cursorReducer,
  initialCursorState,
  highlightReducer,
  initialHighlightState,
  statsReducer,
  initialStatsState,
} from "../components/reducers";

let text = generateWords();
let textData = createTextDatabase(text);
let textHolder = textData.map((word) => {
  return { value: "", visited: false };
});

export default function Home() {
  const [activeWord, setActiveWord] = useState(0);
  const [textDatabase, setTextDatabase] = useState(textData);
  const [textTyped, setTextTyped] = useState(textHolder);

  const [cursorState, cursorDispatcher] = useReducer(
    cursorReducer,
    initialCursorState
  );
  const [highlightState, highlightDispatcher] = useReducer(
    highlightReducer,
    initialHighlightState
  );
  const [lineOffset, setLineOffset] = useState(0);

  const [statsState, statsDispatcher] = useReducer(
    statsReducer,
    initialStatsState
  );
  const [wpm, setWpm] = useState(0);

  const [timeTotal, setTimeTotal] = useState(30);
  const [time, setTime] = useState(timeTotal);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);

  const paragraphRef = useRef(null);
  const rootRef = useRef(null);
  const textPageRef = useRef(null);
  const textOffset = useOffset(rootRef, textPageRef);

  // HELPER FUNCTIONS
  const updateTextTypedArray = (targetIndex, newValue) => {
    setTextTyped((textTyped) => {
      return textTyped.map((w, i) => {
        if (i == targetIndex) {
          return newValue;
        } else {
          return w;
        }
      });
    });
  };

  // TYPING LOGIC
  const handleTextTyped = (value, index = activeWord) => {
    updateTextTypedArray(index, value);
  };

  const handleWordChanged = (newActiveWord) => {
    setActiveWord(newActiveWord);
  };

  const handleLineChange = (linePos) => {
    if (linePos.bottom > window.innerHeight / 2 - textOffset.top) {
      setLineOffset(window.innerHeight / 2 - textOffset.top - linePos.bottom);
    }
  };

  // COUNTER
  useInterval(
    () => {
      setTime((time) => time - 1);
    },
    isRunning ? 1000 : null
  );

  useEffect(() => {
    if (time <= 0) {
      setIsRunning(false);
      setFinished(true);
      setTime(0);
    }
  }, [time]);

  // HANDLE TEXT TYPED
  useDidUpdateEffect(() => {
    setIsRunning(true);
  }, [textTyped[0].value]);

  // Stats
  useDidUpdateEffect(() => {
    setWpm(Math.floor(statsState.correct / 5 / ((timeTotal - time) / 60)));
  }, [time]);

  // CUSTOMIZE SETTINGS

  useEffect(() => {
    if (!isRunning) {
      setTime(timeTotal);
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
              <span className={styles.largeScoreLabel}>WPM</span>
              <span className={styles.largeScoreNumber}>
                {wpm.toLocaleString("en-US", {
                  maximumIntegerDigits: 3,
                  useGrouping: false,
                })}
              </span>
            </div>
            <div className={styles.smallScoreWrapper}>
              <div className={styles.smallScore}>
                <span className={styles.smallScoreLabel}>%</span>
                <span className={styles.smallScoreNumber}>
                  {(
                    (statsState.correct /
                      (statsState.correct + statsState.incorrect)) *
                      100 || 0
                  ).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className={styles.textColumn}>
          <div ref={textPageRef} className={styles.textPage}>
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
                onUpdateStats={statsDispatcher}
              />
              <div className={styles.textWrapper}>
                {textDatabase.map((word, i) => {
                  return (
                    <Word
                      id={i}
                      word={word}
                      active={activeWord == i}
                      typed={textTyped[i]}
                      key={`WORD-${i}`}
                      onLetterUpdate={cursorDispatcher}
                      onWordUpdate={highlightDispatcher}
                      finished={finished}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <Menu
            className={styles.menu}
            isFinished={finished}
            isRunning={isRunning}
            time={time}
            timeTotal={timeTotal}
            onChangeTimeTotal={setTimeTotal}
          ></Menu>
          {/* DEBUG */}
          {/* <pre>{JSON.stringify({ activeWord }, null, 4)}</pre> */}
        </div>
        {finished && (
          <div className={styles.streakColumn}>
            <div className={styles.largeScore}>
              <span className={styles.largeScoreLabel}>Highest Streak</span>
              <span className={styles.largeScoreNumber}>
                {statsState.maxStreak}
              </span>
            </div>
            <div className={styles.smallScoreWrapper}>
              <div className={styles.smallScore}>
                <span className={styles.smallScoreLabel}>Good</span>
                <span className={styles.smallScoreNumber}>
                  {statsState.correct}
                </span>
              </div>
              <div className={styles.smallScore}>
                <span className={styles.smallScoreLabel}>Miss</span>
                <span className={`${styles.smallScoreNumber} ${styles.miss}`}>
                  {statsState.incorrect}
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
