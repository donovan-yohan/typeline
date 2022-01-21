import React, { useRef, useEffect, useState } from "react";
import Letter from "./letter";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect";
import { getCorrections, BACKSPACE_CHAR } from "../utils/typedDataUtils";
import {
  CursorSetLetterRefPayload,
  HighlightActionType,
  HighlightSetWordRefPayload,
  TextTypedActionType,
  TextTypedInitPayload,
  TextTypedUpdatePayload,
  TypedData,
} from "./reducers";
interface Props {
  id: number;
  active: boolean;
  word: string[];
  typed: TypedData;
  onLetterUpdate: React.Dispatch<CursorSetLetterRefPayload>;
  onWordUpdate: React.Dispatch<HighlightSetWordRefPayload>;
  finished: boolean;
  onUpdateStats: React.Dispatch<TextTypedUpdatePayload | TextTypedInitPayload>;
}

export default React.memo(function Word({
  id,
  active,
  word,
  typed,
  onLetterUpdate,
  onWordUpdate,
  onUpdateStats,
}: Props) {
  const wordString = word.join("");
  const [fullTyped, setFullTyped] = useState("");
  const [lastInfo, setLastInfo] = useState({ lastChar: "", lastLength: 0 });
  const [stats, setStats] = useState({
    correct: 0,
    incorrect: 0,
    corrected: 0,
  });
  const [backspaceCorrections, setBackspaceCorrections] = useState(0);
  const isPerfect = stats.incorrect == 0 && typed.visited;
  const isCorrect = typed.value == wordString;
  const wordRef = useRef(null);
  const overflowText =
    typed.value.length > word.length
      ? typed.value.substring(word.length, typed.value.length)
      : "";

  useEffect(() => {
    if (active) {
      onWordUpdate({ type: HighlightActionType.UPDATE, wordRef: wordRef });
    }
  }, [active]);

  // UPDATE STATS ON LETTER CHANGE
  useDidUpdateEffect(() => {
    // CHECK IF CHARACTER WAS ADDED OR REMOVED
    if (typed.value.length > lastInfo.lastLength) {
      if (typed.value[typed.value.length - 1] == word[typed.value.length - 1]) {
        let corrections = getCorrections(
          wordString.substring(0, typed.value.length),
          fullTyped,
          wordString
        );
        setStats((stats) => {
          return {
            correct: stats.correct + 1,
            incorrect: stats.incorrect,
            corrected: corrections || stats.corrected,
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
    } else if (typed.value.length < lastInfo.lastLength) {
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
    if (typed.value.length != lastInfo.lastLength) {
      setLastInfo({
        lastChar: typed.value[typed.value.length - 1],
        lastLength: typed.value.length,
      });
    }
  }, [fullTyped]);

  // UPDATE STATS AND CORRECTIONS ON WORD CHANGE
  useDidUpdateEffect(() => {
    let badBackspace = 0;
    let goodBackspace = backspaceCorrections;
    let goodSpace = 0;
    let badSpace = 0;
    if (
      active &&
      typed.value == wordString &&
      typed.value.length == lastInfo.lastLength
    ) {
      badBackspace = 1;
    } else if (active && typed.value != wordString && typed.value.length > 0) {
      goodBackspace += 1;
      setBackspaceCorrections(
        (backspaceCorrections) => backspaceCorrections + 1
      );
    } else if (!active && typed.value == wordString) {
      goodSpace = 1;
    } else if (!active && typed.value != wordString && typed.value.length > 0) {
      badSpace = 1;
    }

    let corrections = getCorrections(wordString, fullTyped);

    setStats((stats) => {
      return {
        correct: stats.correct + goodSpace,
        incorrect: stats.incorrect + badBackspace + badSpace,
        corrected: corrections + goodBackspace,
      };
    });
  }, [active]);

  // SEND UPDATE BACK
  useDidUpdateEffect(() => {
    onUpdateStats({
      type: TextTypedActionType.UPDATE,
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
                onLetterUpdate={onLetterUpdate}
                isPerfect={isPerfect}
                isCorrect={isCorrect}
                key={`${id}-CHAR-${i}`}
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
                onLetterUpdate={onLetterUpdate}
                overflow={true}
                key={`${id}-OVERFLOW-${i + word.length}`}
              />
            );
          })}
        </span>
      </span>

      <style jsx>{`
        .word {
          font-size: 2.65em;
          letter-spacing: 0.02em;
          line-height: 2.1;
          white-space: pre;
          user-select: none;
          position: relative;
          margin-right: 0.5em;
        }
      `}</style>
    </span>
  );
});
