import Head from "next/head";
import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import Word from "../components/word.js";
import Cursor from "../components/cursor.js";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";

export default function Home() {
  let text =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non felis congue, scelerisque lacus eu, interdum libero. Pellentesque consectetur vel nulla non faucibus. Curabitur rhoncus turpis sit amet augue placerat, ut facilisis velit condimentum. Nulla et nisi at libero euismod iaculis nec at purus. Etiam consequat enim a felis vehicula accumsan. Aliquam erat volutpat. Nullam ac scelerisque metus, in suscipit orci. Pellentesque consectetur nulla neque, nec lacinia arcu iaculis eu.";

  // create array of words and letters
  let textData = text.split(" ").map((word) => {
    let letters = word.split("");
    letters.push(" ");
    return letters.map((l, i) => {
      return { value: l, flatIndex: i };
    });
  });

  // generate flat indexes for 2D array
  textData.reduce((a, w, i) => {
    return (
      a +
      w.reduce((a2, l, k) => {
        l.flatIndex = a + k;
        return a2 + 1;
      }, 0)
    );
  }, 0);

  const [activeWord, setActiveWord] = useState(0);
  const [textDatabase, setTextDatabase] = useState(textData);
  const [textTyped, setTextTyped] = useState("");
  const [letterRef, setLetterRef] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [streak, setStreak] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeTotal, setTimeTotal] = useState(30);
  const [timeElapsed, setTimeElapsed] = useState("");
  const [timeBarWidth, setTimeBarWidth] = useState(0);
  const [oldLength, setOldLength] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const timeBarRef = useRef(null);

  let handleTextTyped = (textEl) => {
    setTextTyped(textEl.value);
  };

  let placeCursor = (ref) => {
    setLetterRef(ref);
  };

  // START GAME
  useEffect(() => {
    if (started && !finished) {
      setTimeElapsed(0);
    }
  }, [started]);

  // FINISH GAME
  useEffect(() => {
    setTextTyped("");
    setActiveWord(0);
    placeCursor(letterRef);
  }, [finished]);

  // COUNTER
  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        setTimeElapsed(timeElapsed + 1);
        if (timeElapsed >= timeTotal) {
          setStarted(false);
          setFinished(true);
          setTimeElapsed(timeTotal);
        }
      }, 1000);
      setTimeBarWidth(
        (timeBarRef.current.clientWidth * (timeTotal - timeElapsed)) / timeTotal
      );
      return () => clearTimeout(timer);
    }
  }, [timeElapsed]);

  // HANDLE TEXT TYPED
  useDidUpdateEffect(() => {
    if (
      textTyped.length >
      textDatabase[activeWord][textDatabase[activeWord].length - 1].flatIndex
    ) {
      setActiveWord(activeWord + 1);
    } else if (textTyped.length < textDatabase[activeWord][0].flatIndex) {
      setActiveWord(activeWord - 1);
    }

    setStarted(true);
  }, [textTyped]);

  // UPDATE STATS
  useDidUpdateEffect(() => {
    let newIncorrect = incorrect;
    let newCorrect = correct;
    if (started && !finished && textTyped.length > 0) {
      if (
        textTyped.charAt(textTyped.length - 1) ==
          textDatabase.flat()[textTyped.length - 1].value &&
        textTyped.length > oldLength
      ) {
        newCorrect += 1;
        setCorrect(newCorrect);
        setStreak(streak + 1);
      } else if (
        textTyped.charAt(textTyped.length - 1) !=
          textDatabase.flat()[textTyped.length - 1].value &&
        textTyped.length > oldLength
      ) {
        newIncorrect += 1;
        setIncorrect(newIncorrect);
        setStreak(0);
      } else {
        setStreak(0);
      }
      setWpm(Math.floor(newCorrect / 5 / (timeElapsed / 60)));
      setOldLength(textTyped.length);
    }
  }, [textTyped]);

  useEffect(() => {
    if (streak > maxStreak) {
      setMaxStreak(streak);
    }
  }, [streak]);

  useDidUpdateEffect(() => {
    setWpm(Math.floor(correct / 5 / (timeElapsed / 60)));
  }, [timeElapsed]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
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
              <span className={styles.smallScoreLabel}>Acc</span>
              <span className={styles.smallScoreNumber}>
                {(
                  (correct / (incorrect + correct)) * 100.0 || 0
                ).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                %
              </span>
            </div>
            <div className={styles.smallScore}>
              <span className={styles.smallScoreLabel}>Right</span>
              <span className={styles.smallScoreNumber}>{correct}</span>
            </div>
            <div className={styles.smallScore}>
              <span className={styles.smallScoreLabel}>Wrong</span>
              <span className={styles.smallScoreNumber}>{incorrect}</span>
            </div>
          </div>
        </div>
        <div className={styles.textColumn}>
          <Cursor
            onTextTyped={handleTextTyped}
            letterRef={letterRef}
            activeWord={activeWord}
            textDatabase={textDatabase}
          />
          <div className={styles.textWrapper}>
            {textDatabase.map((word, i) => {
              return (
                <Word
                  id={i}
                  word={word}
                  active={activeWord}
                  typed={textTyped}
                  data={textDatabase}
                  key={`WORD-${i}`}
                  onLetterUpdate={placeCursor}
                  finished={finished}
                />
              );
            })}
          </div>
          <div className={styles.timeWrapper}>
            <span
              className={styles.timeBarProgress}
              style={{ width: timeBarWidth }}
            ></span>
            <span className={styles.timeBar} ref={timeBarRef}></span>
          </div>
        </div>
        <div className={styles.streakColumn}>
          <div className={styles.largeScore}>
            <span className={styles.largeScoreLabel}>Time</span>
            <span className={styles.largeScoreNumber}>
              {" "}
              {Math.floor((timeTotal - timeElapsed) / 60)}:
              {((timeTotal - timeElapsed) % 60).toLocaleString("en-US", {
                minimumIntegerDigits: 2,
                useGrouping: false,
              })}
            </span>
          </div>
          <div className={styles.smallScoreWrapper}>
            <div className={styles.smallScore}>
              <span className={styles.smallScoreLabel}>Streak</span>
              <span className={styles.smallScoreNumber}>{streak}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
