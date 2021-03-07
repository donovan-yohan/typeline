import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import Word from "../components/word.js";
import Cursor from "../components/cursor.js";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";
import useInterval from "@use-it/interval";
import generateWords from "../utils/generateWords.js";
import createTextDatabase from "../utils/createTextDatabase.js";
import { useOffset } from "../hooks/useOffset.js";

let text = generateWords();
let textData = createTextDatabase(text);
let textHolder = textData.map((word) => {
  return "";
});

export default function Home() {
  const [activeWord, setActiveWord] = useState(0);
  const [textDatabase, setTextDatabase] = useState(textData);
  const [textTyped, setTextTyped] = useState(textHolder);
  const [wordRef, setWordRef] = useState(null);
  const [letterRef, setLetterRef] = useState(null);
  const [lineOffset, setLineOffset] = useState(0);
  const [isFirstChar, setIsFirstChar] = useState(true);
  const [wpm, setWpm] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeTotal, setTimeTotal] = useState(5);
  const [time, setTime] = useState(timeTotal);
  const [maxStreak, setMaxStreak] = useState(0);

  const paragraphRef = useRef(null);
  const rootRef = useRef(null);
  const textPageRef = useRef(null);
  const textOffset = useOffset(rootRef, textPageRef);

  const timeFraction = time / timeTotal;
  const timeBarOffset = timeFraction - (1 / timeTotal) * (1 - timeFraction);

  // HELPER FUNCTIONS
  let updateTextTypedArray = (targetIndex, newValue) => {
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
  let handleTextTyped = (text) => {
    updateTextTypedArray(activeWord, text);
  };

  let handleWordChanged = (newActiveWord) => {
    setActiveWord(newActiveWord);
  };

  let placeCursor = (letterRef, isFirstChar) => {
    setLetterRef(letterRef);
    setIsFirstChar(isFirstChar);
  };

  let placeHighlight = (wordRef) => {
    setWordRef(wordRef);
  };

  let handleLineChange = (change) => {
    setLineOffset(textOffset.top - change);
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
  }, [textTyped[0]]);

  // UPDATE STATS
  let handleValidateWord = () => {};

  let handleResetStreak = () => {
    setStreak(0);
  };

  let handleUpdateScore = (change) => {
    if (change > 0) {
      setCorrect((correct) => correct + 1);
      setStreak((streak) => streak + 1);
    } else {
      setIncorrect((incorrect) => incorrect + 1);
      handleResetStreak();
    }
  };

  useEffect(() => {
    if (streak > maxStreak) {
      setMaxStreak(streak);
    }
  }, [streak]);

  useDidUpdateEffect(() => {
    setWpm(Math.floor(correct / 5 / ((timeTotal - time) / 60)));
  }, [time]);

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
                    (correct / (correct + incorrect)) * 100 || 0
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
                wordRef={wordRef}
                letterRef={letterRef}
                paragraphRef={paragraphRef}
                activeWord={activeWord}
                activeWordTyped={textTyped[activeWord]}
                textDatabase={textDatabase}
                finished={finished}
                isFirstChar={isFirstChar}
                onLineChange={handleLineChange}
                onValidateWord={handleValidateWord}
                onResetStreak={handleResetStreak}
                onUpdateScore={handleUpdateScore}
              />
              <div className={styles.textWrapper}>
                {textDatabase.map((word, i) => {
                  return (
                    <Word
                      id={i}
                      word={word}
                      active={activeWord == i}
                      currentId={activeWord}
                      typed={textTyped[i]}
                      key={`WORD-${i}`}
                      onLetterUpdate={placeCursor}
                      onWordUpdate={placeHighlight}
                      finished={finished}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          <div className={styles.timeWrapper}>
            <span className={styles.timeBar}>
              <span
                className={styles.timeBarProgress}
                style={{
                  transform: `translateX(${-1 * (1 - timeBarOffset) * 100}%)`,
                }}
              ></span>
            </span>
            <span className={styles.time}>
              {Math.floor(time / 60)}:
              {(time % 60).toLocaleString("en-US", {
                minimumIntegerDigits: 2,
                useGrouping: false,
              })}
            </span>
          </div>
          {/* DEBUG */}
          {/* <pre>{JSON.stringify({ activeWord }, null, 4)}</pre> */}
        </div>
        {finished && (
          <div className={styles.streakColumn}>
            <div className={styles.largeScore}>
              <span className={styles.largeScoreLabel}>Highest Streak</span>
              <span className={styles.largeScoreNumber}>{maxStreak}</span>
            </div>
            <div className={styles.smallScoreWrapper}>
              <div className={styles.smallScore}>
                <span className={styles.smallScoreLabel}>Good</span>
                <span className={styles.smallScoreNumber}>{correct}</span>
              </div>
              <div className={styles.smallScore}>
                <span className={styles.smallScoreLabel}>Miss</span>
                <span className={styles.smallScoreNumber}>{incorrect}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
