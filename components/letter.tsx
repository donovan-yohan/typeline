import { LetterType, WordState } from "interfaces/typeline";
import React, { useRef, useLayoutEffect, useEffect } from "react";
import { CursorActionType, CursorSetLetterRefPayload } from "./reducers";
const cx = require("classnames");

interface Props {
  isActive: Boolean;
  wordString: string;
  wordState: WordState;
  letter: LetterType;
  onLetterUpdate: React.Dispatch<CursorSetLetterRefPayload>;
  id: number;
  wordId: number;
  isPerfect?: boolean | undefined;
  isCorrect?: boolean | undefined;
}

export default React.memo(function Letter({
  isActive,
  wordString,
  wordState,
  letter,
  onLetterUpdate,
  id,
  wordId,
  isPerfect = false,
  isCorrect = false
}: Props) {
  const letterRef = useRef(null);
  const visited = wordState !== WordState.UNVISITED;
  const isLetterActive = wordString.length - 1 === id;
  const isFirstLetterActive = id === 0 && wordString.length === 0;
  const isOverflow = letter.value === "";
  const letterClassList = cx({
    letterWrapper: true,
    correct: letter.value === letter.received && letter.value !== "",
    incorrect: letter.received && letter.received !== letter.value,
    incorrectUntyped: visited && isOverflow,
    overflow: isOverflow,
    perfect: isPerfect,
    incorrectAnimate: (visited && !isCorrect) || (visited && isOverflow)
  });
  // handle first initial load
  useLayoutEffect(() => {
    if (wordId === 0 && id === 0) {
      onLetterUpdate({
        type: CursorActionType.UPDATE,
        letterRef: letterRef,
        isFirstChar: true
      });
    }
  }, []);

  useEffect(() => {
    if (isActive && isFirstLetterActive) {
      onLetterUpdate({
        type: CursorActionType.UPDATE,
        letterRef: letterRef,
        isFirstChar: true
      });
    } else if (isActive && isLetterActive) {
      onLetterUpdate({
        type: CursorActionType.UPDATE,
        letterRef: letterRef,
        isFirstChar: false
      });
    }
  }, [isLetterActive, isActive, isFirstLetterActive]);

  return (
    <span className={letterClassList}>
      <span ref={letterRef}>{isOverflow ? letter.received : letter.value}</span>
      <style jsx>{`
        .letterWrapper {
          display: inline-block;
          position: relative;
          transition: all 0.4s ease;
          color: var(--gray);
        }
        .letterWrapper:after {
          opacity: 0;
          width: 100%;
          text-align: center;
          content: "a";
          font-size: 0.5em;
          position: absolute;
          left: 0;
          bottom: 50%;
          transition: 0.3s cubic-bezier(0.27, 0.38, 0.14, 0.99);
        }

        .incorrect,
        .incorrect:after,
        .incorrectUntyped,
        .overflow {
          animation: springWiggle 0.2s cubic-bezier(0, 0.95, 0.25, 1);
        }
        .overflow {
          color: var(--incorrect);
          opacity: var(--fade);
        }
        .incorrect {
          color: var(--incorrect);
        }
        .incorrect:after {
          content: "${letter.received}";
          bottom: -17%;
          color: var(--gray);
          opacity: var(--fade);
        }
        .incorrectUntyped {
          text-decoration: underline;
          color: var(--incorrect);
          opacity: var(--fade);
        }

        .correct {
          color: var(--main);
        }
        .perfect {
          animation: 0.5s ease-in-out forwards perfectColor,
            0.25s cubic-bezier(0, 0.5, 0.5, 1) alternate 2 wordBounce;
        }
        .incorrectAnimate {
          animation: springWiggle-2 0.2s running cubic-bezier(0, 0.95, 0.25, 1);
        }

         {
          /* JSX does not support animations/keyframes, each component that needs it must have its own copy... */
        }
        @keyframes wordBounce {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-0.2em);
          }
        }

         {
          /* also used in cursor.js for wiggle */
        }
        @keyframes springWiggle {
          0% {
            transform: translateX(-0.1em);
          }
          25% {
            transform: translateX(0.08em);
          }
          50% {
            transform: translateX(-0.06em);
          }
          75% {
            transform: translateX(0.03em);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes springWiggle-2 {
          0% {
            transform: translateX(-0.1em);
          }
          25% {
            transform: translateX(0.08em);
          }
          50% {
            transform: translateX(-0.06em);
          }
          75% {
            transform: translateX(0.03em);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes perfectColor {
          0% {
            color: var(--main);
          }
          100% {
            color: var(--highlight);
          }
        }
      `}</style>
    </span>
  );
});
