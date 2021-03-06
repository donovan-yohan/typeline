import React, { useRef, useEffect } from "react";
import cx from "classnames";

export default function Letter({
  active,
  typed,
  wordId,
  letter,
  finished,
  onLetterUpdate,
  id,
}) {
  const letterRef = useRef(null);
  const letterClassList = cx({
    untyped: !typed.charAt(id),
    correct: typed.charAt(id) == letter,
    incorrect: typed.charAt(id) && typed?.charAt(id) != letter,
  });

  useEffect(() => {
    if (active && id == typed.length - 1) {
      onLetterUpdate(letterRef);
    } else if (active && typed.length == 0 && id == 0) {
      onLetterUpdate(letterRef, true);
    }
  }, [typed, active]);

  return (
    <span className={"letterWrapper"}>
      <span ref={letterRef} className={letterClassList}>
        {letter}
      </span>
      <style jsx>{`
        span {
          position: relative;
        }
        .untyped {
          color: rgba(0, 0, 0, 0.5);
        }
        .correct {
          color: rgba(0, 0, 0, 1);
          transition: color 0.5s ease;
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
