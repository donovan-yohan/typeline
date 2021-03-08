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
  activeWordTyped,
  textDatabase,
  isFirstChar,
  onLineChange,
  onResetStreak,
  onUpdateScore,
}) {
  const [text, setText] = useState("");
  const [oldLength, setOldLength] = useState(0);
  const typingField = useRef(null);
  const cursorRef = useRef(null);
  const highlightRef = useRef(null);
  const cursorOffset = useOffset(paragraphRef, letterRef);
  const highlightOffset = useOffset(paragraphRef, wordRef, [activeWordTyped]);

  let handleTextTyped = (e) => {
    let w = e.target.value;
    setText(w);

    let expected = textDatabase[activeWord];
    if (w.length > 0 && w.length > oldLength) {
      if (w.charAt(w.length - 1) == expected[w.length - 1]) {
        updateScore(1);
      } else if (w.charAt(w.length - 1) != expected[w.length - 1]) {
        updateScore(-1);
        resetStreak();
      }
    }

    setOldLength(w.length);
  };

  let validateWord = (typed, expected) => {
    if (typed.join("") == expected) {
      updateScore(1);
    } else {
      updateScore(-1);
      resetStreak();
    }
  };

  let resetStreak = () => {
    onResetStreak();
  };

  let updateScore = (change) => {
    onUpdateScore(change);
  };

  useEffect(() => {
    onTextTyped(text);
  }, [text]);

  useEffect(() => {
    setText(activeWordTyped);
  }, [activeWordTyped]);

  let handleSpecialChar = (e) => {
    let newActiveWord = activeWord;

    if (e.key == " " || e.key == "Spacebar") {
      validateWord(textDatabase[activeWord], activeWordTyped);
      e.preventDefault();
      newActiveWord += 1;
    } else if (e.key == "Backspace") {
      resetStreak();
      // if new value matches old and backsapce was pressed, move to previous word
      if (text.length == 0 && text.length == activeWordTyped.length) {
        if (activeWord > 0) newActiveWord -= 1;
      }
    }

    if (newActiveWord != activeWord) onWordChanged(newActiveWord);
  };

  let handleLineChange = (change) => {
    onLineChange(change);
  };

  useEffect(() => {
    typingField.current.focus();
  }, []);

  const handleClick = (e) => {
    e.target.focus();
  };

  // UPDATE CURSOR
  useEffect(() => {
    if (cursorOffset) {
      let pos;
      let x;
      if (activeWordTyped.length <= textDatabase[activeWord].length) {
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
      handleLineChange(highlightOffset.bottom);
    }
  }, [highlightOffset]);

  return (
    <div>
      <span ref={cursorRef} className={"cursor"}></span>
      <span ref={highlightRef} className={"activeHighlight"}></span>

      <input
        ref={typingField}
        value={text}
        onClick={handleClick}
        onKeyDown={handleSpecialChar}
        onChange={handleTextTyped}
        disabled={finished}
      />
      <style jsx>{`
        div {
          z-index: 99;
        }
        .cursor {
          position: absolute;
          display: block;
          background-color: #0077ff;
          width: 3px;
          height: 2.5em;
          border-radius: 4px;
          transition: transform 0.25s ease;
          will-change: transform;
        }
        .cursorAnimate {
          animation: blink 1s infinite;
        }

        input {
          position: absolute;
          z-index: 9999;
          max-width: 50vw;
          font-size: 2em;
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
          background-color: #0077ff;
          opacity: 0.2;
          transition: all 0.25s ease;
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
