import React, {
  Dispatch,
  KeyboardEvent,
  MouseEvent,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { OffsetType, useOffset } from "../hooks/useOffset";
import useEventListener from "../hooks/useEventListener.js";
import { TypelineRef } from "interfaces/typeline";
import { TextTypedPayload } from "./reducers";
import {
  getActiveLetterIndex,
  isInvalidKey,
  isWordCorrect,
  isWordIncorrect,
  updateLetterReceived
} from "utils/cursorUtils";
import { WordType } from "interfaces/typeline";
import Context from "./context";
const cx = require("classnames");

interface Props {
  letterRef: TypelineRef;
  wordRef: TypelineRef;
  paragraphRef: RefObject<HTMLDivElement>;
  onTextTyped: Dispatch<TextTypedPayload>;
  onWordChanged: (newActiveWordIndex: number) => void;
  isFinished: boolean;
  isEditing: boolean;
  isRunning: boolean;
  activeWordIndex: number;
  textTyped: WordType[];
  isFirstChar: boolean;
  onLineChange: (linePos: OffsetType) => void;
  textPageHeight: string;
  isValid: boolean;
  startTime: number;
}

const IGNORE_START_KEYBOARD_INPUTS = ["Escape", " "];

export default function Cursor({
  letterRef,
  wordRef,
  paragraphRef,
  onTextTyped,
  onWordChanged,
  isFinished,
  isRunning,
  activeWordIndex,
  textTyped,
  isFirstChar,
  onLineChange,
  textPageHeight,
  isValid,
  startTime
}: Props) {
  const { addTypedState } = useContext(Context);
  const [repeat, setRepeat] = useState(false);
  const [hasFocus, setHasFocus] = useState(true);
  const [shouldAnimateCursor, setShouldAnimateCursor] = useState(true);
  const typingField = useRef<HTMLInputElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const cursorOffset = useOffset(paragraphRef, letterRef);
  const highlightOffset = useOffset(paragraphRef, wordRef, [
    textTyped[activeWordIndex].letters.length
  ]);

  const cursorClassList = cx({
    cursor: true,
    cursorAnimate: shouldAnimateCursor,
    hideCursor: !hasFocus && isRunning
  });

  const inputClassList = cx({
    focusBanner: true,
    lostFocus: !hasFocus && isRunning
  });

  // Handle input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // TODO: Handle custom keyboard combos
    if (isInvalidKey(e.key)) return;

    const word = textTyped[activeWordIndex];
    if (e.key == " ") {
      e.preventDefault();
      if (!repeat && getActiveLetterIndex(word) > 0) {
        // handle holding character down
        setRepeat(true);

        onWordChanged(activeWordIndex + 1);
        addTypedState(e.key);
      }
    } else if (e.key == "Backspace") {
      e.preventDefault();
      if (getActiveLetterIndex(word) === 0) {
        if (activeWordIndex == 0) return;
        // only allow backspace if last word was incorrect
        if (isWordIncorrect(textTyped[activeWordIndex - 1])) {
          onWordChanged(activeWordIndex - 1);
          addTypedState(e.key);
        }
      } else {
        onTextTyped(
          updateLetterReceived(
            activeWordIndex,
            getActiveLetterIndex(word) - 1,
            textTyped,
            "",
            new Date().getTime() - startTime
          )
        );
        addTypedState(e.key);
      }
    } else {
      onTextTyped(
        updateLetterReceived(
          activeWordIndex,
          getActiveLetterIndex(word),
          textTyped,
          e.key,
          new Date().getTime() - startTime
        )
      );
      addTypedState(e.key);
    }

    // remove cursor animation when typing
    console.log(textTyped);
    setShouldAnimateCursor(false);
    console.log(getActiveLetterIndex(word));
  };

  const checkIfHoldingKey = () => {
    setRepeat(false);
    setShouldAnimateCursor(true);
  };

  // UPDATE TEXT POSITION
  let handleLineChange = (linePos: OffsetType) => {
    onLineChange(linePos);
  };

  // Focus text on load and when focus is assigned
  useEffect(() => {
    if (hasFocus && typingField.current) typingField.current.focus();
  }, [hasFocus]);

  // FOCUS TEXT ON CLICK
  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    setHasFocus(true);
    e.currentTarget.focus();
  };

  // Focus text on first character press
  const [key, setKey] = useState({ key: "" });

  const keyTypedHandler = useCallback(
    ({ key }) => {
      setKey({ key });
    },
    [setKey]
  );
  useEventListener("keydown", keyTypedHandler);

  useEffect(() => {
    if (key.key && !hasFocus && !isRunning && !isFinished) {
      if (
        !IGNORE_START_KEYBOARD_INPUTS.some((input) => key.key === input) &&
        key.key.length === 1
      ) {
        setHasFocus(true);
      }
    }
  }, [key]);
  // --------------------------------------------------

  // UPDATE CURSOR
  useEffect(() => {
    if (cursorOffset) {
      let pos;
      let x;
      pos = cursorOffset;
      x = isFirstChar ? pos.left : pos.right;
      let y = pos.top;
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [cursorOffset, letterRef]);

  // UPDATE HIGHLIGHT
  useEffect(() => {
    if (highlightOffset) {
      let pos = highlightOffset;
      let width = pos.right - pos.left;
      let height = pos.bottom - pos.top;
      if (highlightRef.current) {
        highlightRef.current.style.transform = `translate(${pos.left}px, ${pos.top}px)`;
        highlightRef.current.style.width = width + "px";
        highlightRef.current.style.height = height + "px";
      }
      handleLineChange(highlightOffset);
    }
  }, [highlightOffset]);

  return (
    <div className={"container"}>
      <span ref={cursorRef} className={cursorClassList}></span>
      <span ref={highlightRef} className={"activeHighlight"}></span>
      <span className={inputClassList}>
        <span>Click to focus</span>
      </span>
      <input
        ref={typingField}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={checkIfHoldingKey}
        onBlur={() => {
          setHasFocus(false);
        }}
        disabled={isFinished}
      />
      <style jsx>{`
        .container {
          position: absolute;
          width: 100%;
          height: ${textPageHeight};
          z-index: 99;
        }
        .cursor {
          z-index: 97;
          position: absolute;
          display: block;
          background-color: ${isValid ? "var(--highlight)" : "var(--incorrect)"};
          width: 3px;
          height: 3.5em;
          border-radius: 2px;
          transition: all 0.13s ease;
          will-change: transform;
        }
        .cursorAnimate {
          animation: 0.45s cubic-bezier(0.9, 0, 0, 0.9) 0.66s infinite alternate blink;
        }
        .hideCursor {
          opacity: 0;
          animation: none;
        }

        input {
          width: 100%;
          height: ${textPageHeight};
          position: fixed;
          z-index: 99;
          font-size: 2.5em;
          overflow: hidden;
          opacity: 0;
          padding: 0;
          border: none;
          margin: 0;
          user-select: none;
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
          width: 100%;
          height: ${textPageHeight};
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
          background-color: ${isValid ? "var(--highlight)" : "var(--incorrect)"};
          opacity: 0.2;
          transition: all 0.25s cubic-bezier(0.33, 0, 0, 1);
          border-radius: 4px;
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
