import React, { useRef, useEffect } from "react";

export default function Letter(props) {
  const letterRef = useRef(null);

  useEffect(() => {
    if (props.typed.length == props.flatIndex) {
      props.onLetterUpdate(letterRef);
    }
    if (props.finished && props.flatIndex == 0) {
      props.onLetterUpdate(letterRef);
    }
  }, [props.typed]);

  return (
    <span className={"letterWrapper"}>
      <span
        ref={letterRef}
        className={
          (!props.typed[props.flatIndex]
            ? "untyped"
            : props.typed[props.flatIndex] == props.letter
            ? "correct"
            : props.typed[props.flatIndex] == " "
            ? "incorrect space"
            : "incorrect") +
          (props.letter != " " && props.wordIndex == props.active
            ? " active"
            : "")
        }
      >
        {props.typed[props.flatIndex]
          ? props.typed[props.flatIndex]
          : props.letter}
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
