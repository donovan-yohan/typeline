import React, { useEffect, useRef, useState } from "react";

export default function Cursor({ letterRef, onTextTyped, finished }) {
  const [wordRef, setWordRef] = useState(null);
  const [wordRefPos, setWordRefPos] = useState(null);
  const typingField = useRef(null);
  const cursorRef = useRef(null);
  const highlightRef = useRef(null);

  let handleTextTyped = () => {
    onTextTyped(typingField.current);
  };

  let focusTextField = () => {
    typingField.current.focus();
    let temp = typingField.current.value;
    typingField.current.value = "";
    typingField.current.value = temp;
  };

  useEffect(() => {
    typingField.current.focus();
  });

  // UPDATE CURSOR
  useEffect(() => {
    if (letterRef) {
      let pos = letterRef.current.getBoundingClientRect();
      let height = pos.bottom - pos.top;

      cursorRef.current.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
      cursorRef.current.style.height = height + "px";

      setWordRef(letterRef.current.parentNode.parentNode);
      setWordRefPos(
        letterRef.current.parentNode.parentNode.getBoundingClientRect()
      );
    }
  }, [letterRef]);

  // UPDATE HIGHLIGHT
  // useEffect(() => {
  //   if (wordRef && wordRefPos) {
  //     let pos = wordRefPos;
  //     let rightBound = pos.right;
  //     if (wordRef.lastChild.childNodes[0].innerHTML == " ") {
  //       rightBound = wordRef.lastChild.childNodes[0].getBoundingClientRect()
  //         .left;
  //     }
  //     let width = rightBound - pos.left;
  //     let height = pos.bottom - pos.top;
  //     highlightRef.current.style.top = pos.top + "px";
  //     highlightRef.current.style.left = pos.left + "px";
  //     highlightRef.current.style.width = width + "px";
  //     highlightRef.current.style.height = height + "px";
  //   }
  // }, [wordRef, wordRefPos]);

  // RESET STATE
  useEffect(() => {
    if (finished) typingField.current.value = "";
  }, [finished]);

  return (
    <div>
      <span ref={cursorRef} className={"cursor"}></span>
      <span ref={highlightRef} className={"activeHighlight"}></span>

      <textarea
        ref={typingField}
        onChange={handleTextTyped}
        onClick={focusTextField}
        disabled={finished}
      ></textarea>
      <style jsx>{`
        div {
          z-index: 99;
        }

        .cursor,
        textarea {
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

        textarea {
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
