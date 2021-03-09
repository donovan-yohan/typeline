import React, { useEffect, useRef, useState } from "react";
import getDocumentCoords from "../utils/getDocumentCoords.js";
import { useOffset } from "../hooks/useOffset.js";

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
  const typingField = useRef(null);
  const cursorRef = useRef(null);
  const highlightRef = useRef(null);
  const cursorOffset = useOffset(paragraphRef, letterRef);
  const highlightOffset = useOffset(paragraphRef, wordRef, [
    textTyped[activeWord],
  ]);

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
  let validateWord = (typed, expected) => {
    if (typed.join("") == expected) {
      onUpdateStats({ type: "addCorrect" });
    } else {
      onUpdateStats({ type: "addIncorrect" });
    }
  };

  // UPDATE TEXT ON TYPE AND SEND BACK TO INDEX
  useEffect(() => {
    onTextTyped({ value: text, visited: false });
  }, [text]);

  // HANDLE SPACEBAR AND BACKSPACE FOR CHANGING WORDS

  const handleSpecialChar = (e) => {
    let newActiveWord = activeWord;

    if (e.key == " " || e.key == "Spacebar") {
      e.preventDefault();
      if (!repeat) {
        setRepeat(true);
        // Update stats
        validateWord(textDatabase[activeWord], text);
        newActiveWord += 1;
        setOldLength(0);

        // update word visited
        onTextTyped({ value: text, visited: true }, activeWord);
      }
    } else if (e.key == "Backspace") {
      onUpdateStats({ type: "resetStreak" });
      // if new value matches old and backsapce was pressed, move to previous word
      if (text.length == 0 && text.length == text.length) {
        if (activeWord > 0) newActiveWord -= 1;
        // update word visited
        onTextTyped(
          { value: textTyped[newActiveWord].value, visited: false },
          newActiveWord
        );
      }
    }

    if (newActiveWord != activeWord) {
      setText(textTyped[newActiveWord].value);
      onWordChanged(newActiveWord);
    }
  };

  const checkIfHoldingKey = (e) => {
    setRepeat(false);
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
      <span ref={cursorRef} className={"cursor"}></span>
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
          transition: all 0.15s ease-in-out;
          will-change: transform;
        }
        .cursorAnimate {
          animation: blink 1s infinite;
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
          30% {
            opacity: 0.1;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
