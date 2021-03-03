import Head from "next/head";
import React, { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";
import Word from "../components/word.js";
import Cursor from "../components/cursor.js";

export default function Home() {
  let text =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non felis congue, scelerisque lacus eu, interdum libero. Pellentesque consectetur vel nulla non faucibus. Curabitur rhoncus turpis sit amet augue placerat, ut facilisis velit condimentum. Nulla et nisi at libero euismod iaculis nec at purus. Etiam consequat enim a felis vehicula accumsan. Aliquam erat volutpat. Nullam ac scelerisque metus, in suscipit orci. Pellentesque consectetur nulla neque, nec lacinia arcu iaculis eu.";
  let textData = text.split(" ").map((word) => {
    let wordWithSpace = word.split("");
    wordWithSpace.push(" ");
    return wordWithSpace.map((letter) => {
      return {
        value: letter,
        typed: "",
      };
    });
  });

  const [activeWord, setActiveWord] = useState(0);
  const [activeLetter, setActiveLetter] = useState(0);
  const [oldLength, setOldLength] = useState(0);
  const [textDatabase, setTextDatabase] = useState(textData);
  const [activeChar, setActiveChar] = useState("");

  let handleTextTyped = async (text) => {
    if (text.length > oldLength) {
      let temp = textDatabase;
      temp[activeWord][activeLetter].typed = text.charAt(text.length - 1);
      setTextDatabase(temp);

      let l = textDatabase[activeWord][activeLetter];
      if (l.typed == l.value) {
        // it's correct
      } else {
        // it's incorrect
      }

      let nextLetter = activeLetter + 1;
      setActiveLetter(nextLetter);

      if (nextLetter == textDatabase[activeWord].length) {
        setActiveWord(activeWord + 1);
        setActiveLetter(0);
      }
    } else {
      let previousLetter = activeLetter - 1;
      setActiveLetter(previousLetter);

      if (previousLetter < 0 && activeWord > 0) {
        let previousWord = activeWord - 1;
        setActiveWord(previousWord);
        setActiveLetter(textDatabase[previousWord].length - 1);
      } else if (previousLetter < 0 && activeWord == 0) {
        setActiveLetter(0);
      }

      let temp = textDatabase;
      temp[activeWord][previousLetter].typed = "";
      setTextDatabase(temp);
    }
    setOldLength(text.length);
    console.log(textDatabase);
  };


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
                  active={activeWord}
                  word={word}
                  key={i + "-" + word + "-" + textDatabase.toString()}
                />
              );
            })}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  );
}
