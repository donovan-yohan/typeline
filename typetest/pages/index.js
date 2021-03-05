import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import Word from "../components/word.js";
import Cursor from "../components/cursor.js";

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

  let handleTextTyped = (text) => {
    setTextTyped(text);
  };

  let placeCursor = (ref) => {
    setLetterRef(ref);
  };

  useEffect(() => {
    if (
      textTyped.length >
      textDatabase[activeWord][textDatabase[activeWord].length - 1].flatIndex
    ) {
      setActiveWord(activeWord + 1);
    } else if (textTyped.length < textDatabase[activeWord][0].flatIndex) {
      setActiveWord(activeWord - 1);
    }
  }, [textTyped]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <div className={styles.streakColumn}>
          <div className={styles.largeScore}>
            <span className={styles.largeScoreLabel}>Streak</span>
            <span className={styles.largeScoreNumber}>{streak}</span>
          </div>
          <div className={styles.smallScoreWrapper}>
            <div className={styles.smallScore}>
              <span className={styles.smallScoreLabel}>R</span>
              <span className={styles.smallScoreNumber}>{correct}</span>
            </div>
            <div className={styles.smallScore}>
              <span className={styles.smallScoreLabel}>W</span>
              <span className={styles.smallScoreNumber}>{incorrect}</span>
            </div>
          </div>
        </div>
        <div className={styles.textColumn}>
          <Cursor onTextTyped={handleTextTyped} letterRef={letterRef} />
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
                />
              );
            })}
          </div>
          <div className={styles.timeWrapper}>
            <span className={styles.timeBar}></span>
            <span className={styles.time}>0:00</span>
          </div>
        </div>
        <div className={styles.wpmColumn}>
          <div className={styles.largeScore}>
            <span className={styles.largeScoreLabel}>WPM</span>
            <span className={styles.largeScoreNumber}>{streak}</span>
          </div>
          <div className={styles.smallScoreWrapper}>
            <div className={styles.smallScore}>
              <span className={styles.smallScoreLabel}>%</span>
              <span className={styles.smallScoreNumber}>{accuracy}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
