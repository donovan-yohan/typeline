import React, { useEffect, useRef, useState } from "react";
import { useOffset } from "../hooks/useOffset.js";
import cx from "classnames";

const BACKSPACE_CHAR_REGEX = /(?:~<)/g;
const BACKSPACE_CHAR = "~<";
const SPLIT_CHAR = "|";

export default function Cursor({
  letterRef,
  wordRef,
  paragraphRef,
  onTextTyped,
  onWordChanged,
  finished,
  activeWord,
  textTyped,
  textDatabase,
  isFirstChar,
  onLineChange,
  onUpdateStats,
}) {
  const [text, setText] = useState("");
  const [oldLength, setOldLength] = useState(0);
  const [valid, setValid] = useState(true);
  const [repeat, setRepeat] = useState(false);
  const [shouldAnimateCursor, setShouldAnimateCursor] = useState(true);
  const typingField = useRef(null);
  const cursorRef = useRef(null);
  const highlightRef = useRef(null);
  const cursorOffset = useOffset(paragraphRef, letterRef);
  const highlightOffset = useOffset(paragraphRef, wordRef, [
    textTyped[activeWord],
  ]);

  const cursorClassList = cx({
    cursor: true,
    cursorAnimate: shouldAnimateCursor,
  });

  // UPDATE STATS AND SEND TO INDEX PAGE
  let handleTextTyped = (e) => {
    let w = e.target.value;
    setText(w);

    let expected = textDatabase[activeWord];
    if (w.length > 0 && w.length > oldLength) {
      if (w.charAt(w.length - 1) == expected[w.length - 1]) {
        onUpdateStats({ type: "addCorrect" });
      } else if (w.charAt(w.length - 1) != expected[w.length - 1]) {
        onUpdateStats({ type: "addIncorrect" });
      }
    }

    setOldLength(w.length);
  };

  // Helper function for stats
  let validateWord = (expected, typed, fullTyped) => {
    let corrections = getCorrections(expected, fullTyped, typed);
    if (typed == expected) {
      onUpdateStats({ type: "addCorrect" });
    } else {
      onUpdateStats({ type: "addIncorrect" });
    }
  };

  const getCorrections = (expectedValue, fullValue, value) => {
    // create array of substrings with backspace separated out, remove empty elements
    let substrings = fullValue
      .replace(
        BACKSPACE_CHAR_REGEX,
        `${SPLIT_CHAR}${BACKSPACE_CHAR}${SPLIT_CHAR}`
      )
      .split(SPLIT_CHAR)
      .filter((c) => c);
    let i = substrings.indexOf(BACKSPACE_CHAR);
    let corrections = 0;
    while (i > 0) {
      substrings[i - 1] = substrings[i - 1].substring(
        0,
        substrings[i - 1].length - 1
      );
      substrings.splice(i, 1);
      corrections++;

      i = substrings.findIndex((s) => s == BACKSPACE_CHAR);
    }

    let incorrect = 0;
    for (let j = 0; j < value.length; j++) {
      if (value[j] != expectedValue[j]) incorrect++;
    }
    // accounts for early space press
    if (value.length < expectedValue.length)
      incorrect += expectedValue.length - value.length;

    console.log(corrections, incorrect, corrections - incorrect);
  };

  // UPDATE TEXT ON TYPE AND SEND BACK TO INDEX
  useEffect(() => {
    let lastVal = textTyped[activeWord].value;
    let lastChar = "";
    if (text.length > lastVal.length) {
      lastChar = text.charAt(text.length - 1);
    }

    onTextTyped({
      value: text,
      fullValue: textTyped[activeWord].fullValue + lastChar,
      visited: false,
    });
  }, [text]);

  // HANDLE SPACEBAR AND BACKSPACE FOR CHANGING WORDS
  const handleSpecialChar = (e) => {
    let newActiveWord = activeWord;

    if (e.key == " " || e.key == "Spacebar") {
      e.preventDefault();
      if (!repeat && (activeWord != 0 || text.length > 0)) {
        // handle holding character down
        setRepeat(true);

        // Update stats
        validateWord(
          textDatabase[activeWord].join(""),
          text,
          textTyped[activeWord].fullValue
        );

        newActiveWord += 1;
        setOldLength(0);

        // update word visited
        onTextTyped(
          {
            value: text,
            fullValue: textTyped[activeWord].fullValue,
            visited: true,
          },
          activeWord
        );
      }
    } else if (e.key == "Backspace") {
      // Update stats
      onUpdateStats({ type: "resetStreak" });

      // if new value matches old and backsapce was pressed, move to previous word
      if (text.length == 0) {
        if (activeWord > 0) {
          newActiveWord -= 1;
          // backspace pressed and last word is already correct, add incorrect
          if (
            textTyped[newActiveWord].value ==
            textDatabase[newActiveWord].join("")
          ) {
            onUpdateStats({ type: "addIncorrect" });
          }
        }
        // update word visited
        setOldLength(textTyped[newActiveWord].value.length);
        onTextTyped(
          {
            value: textTyped[newActiveWord].value,
            fullValue: textTyped[newActiveWord].fullValue,
            visited: false,
          },
          newActiveWord
        );
      } else if (
        textTyped[newActiveWord].value.charAt(
          textTyped[newActiveWord].value.length - 1
        ) ==
        textDatabase[newActiveWord][textTyped[newActiveWord].value.length - 1]
      ) {
        // backspace pressed when letter was correct
        onUpdateStats({ type: "addIncorrect" });
      }

      if (text.length != 0) {
        onTextTyped(
          {
            value: textTyped[newActiveWord].value,
            fullValue: textTyped[newActiveWord].fullValue + BACKSPACE_CHAR,
            visited: false,
          },
          newActiveWord
        );
      }
    }

    if (newActiveWord != activeWord) {
      setText(textTyped[newActiveWord].value);
      onWordChanged(newActiveWord);
    }

    // remove cursor animation when typing
    setShouldAnimateCursor(false);
  };

  const checkIfHoldingKey = (e) => {
    setRepeat(false);
    setShouldAnimateCursor(true);
  };

  // UPDATE TEXT POSITION
  let handleLineChange = (linePos) => {
    onLineChange(linePos);
  };

  // FOCUS TEXT ON LOAD
  useEffect(() => {
    typingField.current.focus();
  }, []);

  // FOCUS TEXT ON CLICK
  const handleClick = (e) => {
    e.target.focus();
  };

  // UPDATE CURSOR
  useEffect(() => {
    if (cursorOffset) {
      let pos;
      let x;
      if (text.length <= textDatabase[activeWord].length) {
        pos = cursorOffset;
        x = isFirstChar ? pos.left : pos.right;
      } else {
        pos = highlightOffset;
        x = pos.right;
      }
      let y = pos.top;
      cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [cursorOffset, highlightOffset, isFirstChar]);

  // UPDATE HIGHLIGHT
  useEffect(() => {
    if (highlightOffset) {
      let pos = highlightOffset;
      let width = pos.right - pos.left;
      let height = pos.bottom - pos.top;
      highlightRef.current.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
      highlightRef.current.style.width = width + "px";
      highlightRef.current.style.height = height + "px";
      handleLineChange(highlightOffset);
    }
  }, [highlightOffset]);

  useEffect(() => {
    if (textDatabase[activeWord].join("").substring(0, text.length) != text) {
      setValid(false);
    } else {
      setValid(true);
    }
  }, [text]);

  return (
    <div>
      <span ref={cursorRef} className={cursorClassList}></span>
      <span ref={highlightRef} className={"activeHighlight"}></span>

      <input
        ref={typingField}
        value={text}
        onClick={handleClick}
        onKeyDown={handleSpecialChar}
        onKeyUp={checkIfHoldingKey}
        onChange={handleTextTyped}
        disabled={finished}
      />
      <style jsx>{`
        div {
          z-index: 99;
        }
        .cursor {
          z-index: 99;
          position: absolute;
          display: block;
          background-color: var(--highlight);
          width: 3px;
          height: 3em;
          border-radius: 4px;
          transition: all 0.13s ease;
          will-change: transform;
        }
        .cursorAnimate {
          animation: 0.45s cubic-bezier(0.9, 0, 0, 0.9) 1s infinite alternate
            blink;
        }

        input {
          position: absolute;
          z-index: 99;
          max-width: 50vw;
          font-size: 2.5em;
          overflow: hidden;
          opacity: 0;
          font-family: Roboto;
          padding: 0;
          border: none;
          margin: 0;
          user-select: none;
          width: 50vw;
          height: 25vh;
          outline: none;
          background-color: transparent;
        }

        .activeHighlight {
          top: 0;
          position: absolute;
          background-color: ${valid ? "var(--highlight)" : "var(--incorrect)"};
          opacity: 0.2;
          transition: all 0.25s cubic-bezier(0.33, 0, 0, 1);
          will-change: transform, width, height;
        }

        @keyframes blink {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
