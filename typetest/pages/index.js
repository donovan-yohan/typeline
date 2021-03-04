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
  const [activeLetter, setActiveLetter] = useState(0);
  const [oldLength, setOldLength] = useState(0);
  const [textDatabase, setTextDatabase] = useState(textData);
  const [textTyped, setTextTyped] = useState("");

  let handleTextTyped = (text) => {
    setTextTyped(text);
  };

  useEffect(() => {}, [textTyped]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.textColumn}>
          <Cursor onTextTyped={handleTextTyped} />
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
                />
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
