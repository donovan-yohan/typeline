import React, { useRef, useEffect, useState } from "react";
import Letter from "../components/letter.js";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect";
import { getCorrections, BACKSPACE_CHAR } from "../utils/getCorrections";

export default React.memo(function Word({
  active,
  word,
  typed,
  id,
  onLetterUpdate,
  onWordUpdate,
  finished,
  onUpdateStats,
}) {
  const wordString = word.join("");
  const [fullTyped, setFullTyped] = useState("");
  const [lastInfo, setLastInfo] = useState({ lastChar: "", lastLength: 0 });
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    corrected: 0,
  });
  const isPerfect = stats.incorrect == 0 && typed.visited;
  const isCorrect = typed.value == wordString;
  const wordRef = useRef(null);
  const overflowText =
    typed.value.length > word.length
      ? typed.value.substring(word.length, typed.value.length)
      : "";

  useEffect(() => {
    if (active) {
      onWordUpdate({ type: "setWordRef", payload: wordRef });
    }
  }, [active]);

  // UPDATE STATS ON LETTER CHANGE
  useDidUpdateEffect(() => {
    // CHECK IF CHARACTER WAS ADDED OR REMOVED
    if (typed.value.length > lastInfo.lastLength) {
      if (typed.value[typed.value.length - 1] == word[typed.value.length - 1]) {
        setStats((stats) => {
          return {
            correct: stats.correct + 1,
            incorrect: stats.incorrect,
            corrected: stats.corrected,
          };
        });
      } else {
        setStats((stats) => {
          return {
            correct: stats.correct,
            incorrect: stats.incorrect + 1,
            corrected: stats.corrected,
          };
        });
      }
    } else {
      // CHARACTER REMOVED, CHECK IF IT WAS ALREADY CORRECT
      if (lastInfo.lastChar == wordString[lastInfo.lastLength - 1]) {
        setStats((stats) => {
          return {
            correct: stats.correct,
            incorrect: stats.incorrect + 1,
            corrected: stats.corrected,
          };
        });
      }
    }
    setLastInfo({
      lastChar: typed.value[typed.value.length - 1],
      lastLength: typed.value.length,
    });
  }, [typed.value]);

  // UPDATE STATS AND CORRECTIONS ON WORD CHANGE
  useDidUpdateEffect(() => {
    let badBackspace = 0;
    let goodBackspace = 0;
    let goodSpace = 0;
    let badSpace = 0;
    if (
      active &&
      typed.value == wordString &&
      typed.value.length == lastInfo.lastLength
    ) {
      badBackspace = 1;
    } else if (active && typed.value != wordString && typed.value.length > 0) {
      goodBackspace = 1;
    } else if (!active && typed.value == wordString) {
      goodSpace = 1;
    } else if (!active && typed.value != wordString && typed.value.length > 0) {
      badSpace = 1;
    }

    let corrections = getCorrections(wordString, fullTyped);
    if (goodBackspace > 0) corrections = stats.corrections + 1;

    setStats((stats) => {
      return {
        correct: stats.correct + goodSpace,
        incorrect: stats.incorrect + badBackspace + badSpace,
        corrected: corrections,
      };
    });
  }, [active]);

  // SEND UPDATE BACK
  useDidUpdateEffect(() => {
    onUpdateStats({
      type: "updateTextTyped",
      targetIndex: id,
      newValue: {
        value: typed.value,
        fullValue: fullTyped,
        stats: stats,
        visited: typed.visited,
      },
    });
  }, [stats]);

  // TRACK ALL TYPED CHARACTERS
  useDidUpdateEffect(() => {
    if (typed.value.length > lastInfo.lastLength) {
      setFullTyped(
        (fullTyped) => fullTyped + typed.value[typed.value.length - 1]
      );
    } else {
      setFullTyped((fullTyped) => fullTyped + BACKSPACE_CHAR);
    }
  }, [typed.value]);

  return (
    <span className={"wordWrapper"}>
      <span ref={wordRef} className={"word"}>
        <span>
          {word.map((letter, i) => {
            return (
              <Letter
                id={i}
                active={active}
                letter={letter}
                typed={typed}
                wordId={id}
                key={`${id}-CHAR-${i}`}
                onLetterUpdate={onLetterUpdate}
                finished={finished}
                isPerfect={isPerfect}
                isCorrect={isCorrect}
              />
            );
          })}
        </span>
        <span className={"overflow"}>
          {overflowText.split("").map((letter, i) => {
            return (
              <Letter
                id={i + word.length}
                active={active}
                letter={letter}
                typed={typed}
                wordId={id}
                key={`${id}-OVERFLOW-${i + word.length}`}
                onLetterUpdate={onLetterUpdate}
                finished={finished}
                overflow={true}
              />
            );
          })}
        </span>
      </span>

      <style jsx>{`
        .word,
        input {
          font-size: 2.5em;
          letter-spacing: 0.02em;
          line-height: 2.25;
        }

        .word {
          white-space: pre;
          user-select: none;
          position: relative;
          margin-right: 0.5em;
        }
      `}</style>
    </span>
  );
});
