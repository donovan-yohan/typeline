import React, { useEffect, useState } from "react";

export default function Letter(props) {
  let flatData = props.data.flat();

  return (
    <span
      className={
        !props.typed[props.flatIndex]
          ? "untyped"
          : props.typed[props.flatIndex] == props.letter
          ? "correct"
          : "incorrect"
      }
    >
      {props.typed[props.flatIndex]
        ? props.typed[props.flatIndex]
        : props.letter}
      <style jsx>{`
        .untyped {
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
