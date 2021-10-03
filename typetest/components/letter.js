import React, { useRef, useEffect } from "react";
import cx from "classnames";

export default React.memo(function Letter({
  active,
  typed,
  letter,
  onLetterUpdate,
  id,
  overflow,
  isPerfect,
  isCorrect,
}) {
  const letterRef = useRef(null);
  const letterClassList = cx({
    letterWrapper: true,
    correct: typed.value.charAt(id) == letter && !overflow,
    incorrect: typed.value.charAt(id) && typed.value.charAt(id) != letter,
    incorrectUntyped: typed.visited && !typed.value.charAt(id),
    overflow: overflow,
    perfect: isPerfect,
    incorrectAnimate:
      (typed.visited && !isCorrect) || (typed.visited && overflow),
  });

  useEffect(() => {
    if (active && id == typed.value.length - 1) {
      onLetterUpdate({
        type: "setLetterRef",
        payload: letterRef,
        isFirstChar: false,
      });
    } else if (active && typed.value.length == 0 && id == 0) {
      onLetterUpdate({
        type: "setLetterRef",
        payload: letterRef,
        isFirstChar: true,
      });
    }
  }, [typed.value, active]);

  return (
    <span className={letterClassList}>
      <span ref={letterRef}>{letter}</span>
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
          content: "${typed.value.charAt(id)}";
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
