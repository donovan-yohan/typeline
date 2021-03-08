import React, { useRef, useEffect } from "react";
import cx from "classnames";

export default React.memo(function Letter({
  active,
  typed,
  letter,
  onLetterUpdate,
  id,
}) {
  const letterRef = useRef(null);
  const letterClassList = cx({
    correct: typed.value.charAt(id) == letter,
    incorrect: typed.value.charAt(id) && typed.value.charAt(id) != letter,
    incorrectUntyped: typed.visited && !typed.value.charAt(id),
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
    <span className={"letterWrapper"}>
      <span ref={letterRef} className={letterClassList}>
        {letter}
      </span>
      <style jsx>{`
        span {
          position: relative;
          transition: color 0.4s ease;
        }
        .untyped {
          color: rgba(0, 0, 0, 0.5);
        }
        .incorrect {
          color: rgb(210, 0, 0);
        }
        .incorrectUntyped {
          text-decoration: underline;
          color: rgba(210, 0, 0, 0.5);
        }
        .correct {
          color: rgba(0, 0, 0, 1);
        }
      `}</style>
    </span>
  );
});
