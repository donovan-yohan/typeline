import React, { useState, useContext } from "react";
import Letter from "../components/letter.js";

export default function Word(props) {
  let active = props.id == props.active;
  let activeClass = active ? "active" : "";

  let classList = activeClass;

  return (
    <span className={"wordWrapper"}>
      <span className={classList + " word"}>
        {props.word.map((letter, i) => {
          return (
            <Letter
              letter={letter.value}
              flatIndex={letter.flatIndex}
              typed={props.typed}
              wordIndex={props.id}
              data={props.data}
              key={`${props.id}-CHAR-${i}`}
            />
          );
        })}
      </span>
      <style jsx>{`
        .word,
        input {
          font-size: 1.33em;
          line-height: 2em;
        }

        .word {
          white-space: pre;
          user-select: none;
          position: relative;
        }

        .active::before {
          content: "";
          position: absolute;
          bottom: 0px;
          height: 100%;
          width: calc(100% - 0.25em);
          background-color: lightgray;
          z-index: -1;
        }
      `}</style>
    </span>
  );
}
