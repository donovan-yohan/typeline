import React, { useRef, useEffect, useState } from "react";
import Letter from "../components/letter.js";

export default function Word({
  active,
  word,
  typed,
  id,
  data,
  onLetterUpdate,
  onWordUpdate,
  finished,
  currentId,
}) {
  const wordRef = useRef(null);
  const overflowText =
    typed.length > word.length
      ? typed.substring(word.length, typed.length)
      : "";

  useEffect(() => {
    if (active) {
      onWordUpdate(wordRef);
    }
  }, [active]);


  return (
    <span className={"wordWrapper"}>
      <span ref={wordRef} className={"word"}>
        <span>
          {word.map((letter, i) => {
            return (
              <Letter
                id={i}
                active={active}
                currentId={currentId}
                letter={letter}
                typed={typed}
                wordId={id}
                data={data}
                key={`${id}-CHAR-${i}`}
                onLetterUpdate={onLetterUpdate}
                finished={finished}
              />
            );
          })}
        </span>
        <span className={"overflow"}>{overflowText}</span>
      </span>
      <style jsx>{`
        .word,
        input {
          font-size: 2em;
          letter-spacing: 0.02em;
          line-height: 2.5em;
        }

        .word {
          white-space: pre;
          user-select: none;
          position: relative;
          margin-right: 0.6em;
        }

        .overflow {
          color: red;
          opacity: 0.66;
        }
      `}</style>
    </span>
  );
}
