import React, { useEffect, useRef, useState } from "react";

export default function Cursor({
  letterRef,
  onTextTyped,
  onWordChanged,
  finished,
  activeWord,
  activeWordTyped,
}) {
  const [wordRef, setWordRef] = useState(null);
  const [wordRefPos, setWordRefPos] = useState(null);
  const [text, setText] = useState("");
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

  // UPDATE CURSOR
  // useEffect(() => {
  //   if (letterRef) {
  //     let pos = letterRef.current.getBoundingClientRect();
  //     let height = pos.bottom - pos.top;

  //     cursorRef.current.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
  //     cursorRef.current.style.height = height + "px";

  //     setWordRef(letterRef.current.parentNode.parentNode);
  //     setWordRefPos(
  //       letterRef.current.parentNode.parentNode.getBoundingClientRect()
  //     );
  //   }
  // }, [letterRef]);

  useEffect(() => {}, [letterRef?.current.getBoundingClientRect()]);

  // UPDATE HIGHLIGHT
  useEffect(() => {
    if (wordRef && wordRefPos) {
      let pos = wordRefPos;
      let rightBound = pos.right;
      if (wordRef.lastChild.childNodes[0].innerHTML == " ") {
        rightBound = wordRef.lastChild.childNodes[0].getBoundingClientRect()
          .left;
      }
      let width = rightBound - pos.left;
      let height = pos.bottom - pos.top;
      highlightRef.current.style.top = pos.top + "px";
      highlightRef.current.style.left = pos.left + "px";
      highlightRef.current.style.width = width + "px";
      highlightRef.current.style.height = height + "px";
    }
  }, [wordRef, wordRefPos]);

  // RESET STATE
  // useEffect(() => {
  //   if (finished) setText("");
  // }, [finished]);

  return (
    <div>
      <span ref={cursorRef} className={"cursor"}></span>
      <span ref={highlightRef} className={"activeHighlight"}></span>

      <input
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
          background-color: rgba(0, 0, 0, 0);
          transition: all 0.2s ease;
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
