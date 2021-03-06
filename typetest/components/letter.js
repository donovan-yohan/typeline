import React, { useRef, useEffect } from "react";
import cx from "classnames";

export default function Letter({
  typed,
  flatIndex,
  letter,
  finished,
  onLetterUpdate,
}) {
  const letterRef = useRef(null);

  useEffect(() => {
    if (typed.length == flatIndex) {
      onLetterUpdate(letterRef);
    }
    if (finished && flatIndex == 0) {
      onLetterUpdate(letterRef);
    }
  }, [typed]);

  return (
    <span className={"letterWrapper"}>
      <span
        ref={letterRef}
        className={cx({
          untyped: !typed[flatIndex],
          correct: typed[flatIndex] == letter,
          incorrect: typed[flatIndex] && typed[flatIndex] != letter,
          space: typed[flatIndex] == " " && typed[flatIndex] != letter,
        })}
      >
        {typed[flatIndex] ? typed[flatIndex] : letter}
      </span>
      <style jsx>{`
        span {
          position: relative;
          transition: color 0.5s ease;
        }
        .untyped {
          color: rgba(0, 0, 0, 0.5);
        }
        .correct {
          color: rgba(0, 0, 0, 1);
        }
        .incorrect {
          color: red;
        }
        .space {
          text-decoration: underline;
        }
      `}</style>
    </span>
  );
}
