import React, { useEffect, useRef, useState } from "react";
import getDocumentCoords from "../utils/getDocumentCoords.js";

export default function Cursor({
  letterRef,
  wordRef,
  onTextTyped,
  onWordChanged,
  finished,
  activeWord,
  activeWordTyped,
  textDatabase,
  isFirstChar,
  onLineChange,
}) {
  const [text, setText] = useState("");
  const typingField = useRef(null);
  const cursorRef = useRef(null);
  const highlightRef = useRef(null);

  let handleTextTyped = (e) => {
    setText(e.target.value);
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
      e.preventDefault();
      newActiveWord += 1;
    } else if (e.key == "Backspace") {
      // if new value matches old and backsapce was pressed, move to previous word
      if (text.length == 0 && text.length == activeWordTyped.length) {
        if (activeWord > 0) newActiveWord -= 1;
      }
    }

    if (newActiveWord != activeWord) onWordChanged(newActiveWord);
  };

  useEffect(() => {
    typingField.current.focus();
  });

  // UPDATE CURSOR
  useEffect(() => {
    if (letterRef) {
      let pos;
      if (activeWordTyped.length <= textDatabase[activeWord].length) {
        pos = getDocumentCoords(letterRef.current);
      } else {
        pos = getDocumentCoords(wordRef.current);
      }

      let height = pos.bottom - pos.top;
      let offset = isFirstChar ? pos.left : pos.right;
      cursorRef.current.style.transform = `translate(${offset}px, ${pos.top}px)`;
      cursorRef.current.style.height = height + "px";
    } else {
      // TODO: initial state
    }
  }, [letterRef, activeWordTyped, isFirstChar]);

  // UPDATE HIGHLIGHT
  useEffect(() => {
    if (wordRef) {
      let lineChange = 0;
      let pos = getDocumentCoords(wordRef.current);
      let width = pos.right - pos.left;
      let height = pos.bottom - pos.top;
      if (
        Math.floor(pos.top) >
        Math.floor(parseFloat(highlightRef.current.style.top))
      ) {
        lineChange += 1;
      } else if (
        Math.floor(pos.top) <
        Math.floor(parseFloat(highlightRef.current.style.top))
      ) {
        lineChange -= 1;
      }
      onLineChange(lineChange);
      highlightRef.current.style.top = pos.top + "px";
      highlightRef.current.style.left = pos.left + "px";
      highlightRef.current.style.width = width + "px";
      highlightRef.current.style.height = height + "px";
    }
  }, [wordRef, activeWordTyped]);

  // RESET STATE
  // useEffect(() => {
  //   if (finished) setText("");
  // }, [finished]);

  return (
    <div>
      <span ref={cursorRef} className={"cursor"}></span>
      <span ref={highlightRef} className={"activeHighlight"}></span>

      <input
        ref={typingField}
        value={text}
        onKeyDown={handleSpecialChar}
        onChange={handleTextTyped}
        disabled={finished}
      />
      <style jsx>{`
        div {
          z-index: 99;
        }

        .cursor,
        input {
          max-width: 50vw;
          font-size: 2em;
          margin: 0;
          user-select: none;
        }
        .cursor {
          z-index: 999;
          background-color: #0077ff;
          width: 3px;
          border-radius: 4px;
          position: absolute;
          top: 0;
          left: 0;
          transition: transform 0.25s ease;
          will-change: transform;
        }
        .cursorAnimate {
          animation: blink 1s infinite;
        }

        input {
          position: absolute;
          overflow: hidden;
          z-index: 999;
          opacity: 0;
          font-family: Roboto;
          padding: 0;
          border: none;
          width: 50vw;
          height: 25vh;
          outline: none;
          resize: none;
          background-color: transparent;
        }

        .activeHighlight {
          position: absolute;
          background-color: rgba(0, 0, 0, 0.15);
          transition: all 0.25s ease;
          will-change: top, left, width, height;
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
