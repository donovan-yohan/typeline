import React, { useEffect, useRef, useState } from "react";
import { useOffset } from "../hooks/useOffset.js";
import cx from "classnames";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";

export default function Cursor({
  letterRef,
  wordRef,
  paragraphRef,
  onTextTyped,
  onWordChanged,
  isFinished,
  isEditing,
  isRunning,
  activeWord,
  textTyped,
  textDatabase,
  isFirstChar,
  onLineChange,
}) {
  const [text, setText] = useState("");
  const [valid, setValid] = useState(true);
  const [repeat, setRepeat] = useState(false);
  const [hasFocus, setHasFocus] = useState(true);
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

  const inputClassList = cx({
    focusBanner: true,
    lostFocus: !hasFocus && isRunning,
  });

  // Reset when textDatabase is changed
  useDidUpdateEffect(() => {
    setText("");
    setHasFocus(true);
  }, [textDatabase]);

  // UPDATE STATS AND SEND TO INDEX PAGE
  let handleTextTyped = (e) => {
    let w = e.target.value;
    setText(w);
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
      stats: textTyped[activeWord].stats,
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

        newActiveWord += 1;

        // update word visited
        onTextTyped(
          {
            value: text,
            fullValue: textTyped[newActiveWord].fullValue,
            stats: textTyped[activeWord].stats,
            visited: true,
          },
          activeWord
        );
      }
    } else if (e.key == "Backspace") {
      e.preventDefault();
      // if new value matches old and backsapce was pressed, move to previous word
      if (text.length == 0) {
        if (activeWord > 0) {
          newActiveWord -= 1;
        }
        // update word visited
        onTextTyped(
          {
            value: textTyped[newActiveWord].value,
            fullValue: textTyped[newActiveWord].fullValue,
            stats: textTyped[newActiveWord].stats,
            visited: false,
          },
          newActiveWord
        );
      }

      if (text.length != 0) {
        setText(text.substring(0, text.length - 1));
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

  useDidUpdateEffect(() => {
    if (hasFocus) typingField.current.focus();
  }, [hasFocus]);

  // FOCUS TEXT ON CLICK
  const handleClick = (e) => {
    setHasFocus(true);
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
      <span className={inputClassList}>
        <span>Click to focus</span>
      </span>
      <input
        ref={typingField}
        value={text}
        onClick={handleClick}
        onKeyDown={handleSpecialChar}
        onKeyUp={checkIfHoldingKey}
        onChange={handleTextTyped}
        onBlur={() => {
          setHasFocus(false);
        }}
        disabled={isFinished}
      />
      <style jsx>{`
        div {
          z-index: 99;
        }
        .cursor {
          z-index: 97;
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
          animation: 0.45s cubic-bezier(0.9, 0, 0, 0.9) 0.66s infinite alternate
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
          height: 30vh;
          outline: none;
          background-color: transparent;
          border-radius: 4px;
        }

        .focusBanner {
          z-index: 98;
          display: flex;
          justify-content: center;
          align-items: center;
          position: absolute;
          height: 30vh;
          width: 100%;
          color: var(--main);
          background-color: var(--tooltipColourFade);
          transition: opacity 0.2s ease-in-out;
          opacity: 0;
          border-radius: 8px;
          user-select: none;

          font-size: 32px;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.33em;
        }

        .lostFocus {
          opacity: 1;
          animation: springWiggle 0.45s cubic-bezier(0, 0.95, 0.25, 1);
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

        @keyframes springWiggle {
          0% {
            transform: translateX(0.6em);
          }
          17% {
            transform: translateX(-0.25em);
          }
          34% {
            transform: translateX(0.18em);
          }
          51% {
            transform: translateX(-0.12em);
          }
          68% {
            transform: translateX(0.08em);
          }
          85% {
            transform: translateX(-0.03em);
          }
          100% {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
