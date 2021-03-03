import React, { useEffect, useState } from "react";

export default function Letter(props) {
  const [state, setState] = useState("untouched");

  return (
    <span
      className={
        props.typed == ""
          ? "untouched"
          : props.typed == props.letter
          ? "correct"
          : "incorrect"
      }
    >
      {props.typed ? props.typed : props.letter}
      <style jsx>{`
        .untouched {
          opacity: 0.5;
        }
        .correct {
          opacity: 1;
        }
        .incorrect {
          color: red;
        }
      `}</style>
    </span>
  );
}
