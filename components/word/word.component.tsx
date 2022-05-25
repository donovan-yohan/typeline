import React from "react";
import { LetterProps, WordProps } from "./word.definition";
import { LetterSpan, WordWrapper } from "./word.style";

export const Letter = (props: LetterProps) => {
  const { expected, actual, active, wordPassed } = props;

  const letter = expected ? expected : actual;
  const correct = expected === actual;
  const overflow = expected === "";
  const untyped = wordPassed && !actual;

  let color = "lightgray";
  if (active && correct) color = "green";
  if ((active && !correct) || overflow || untyped) color = "red";

  const opacity = untyped ? 0.5 : 1;

  return (
    <LetterSpan
      color={color}
      opacity={opacity}
      underline={untyped}
      actual={actual}
      showWrongLetter={!correct && !overflow}
    >
      {letter}
    </LetterSpan>
  );
};

const Word = (props: WordProps) => {
  const { expected, actual, id, index, activeIndex } = props;

  const overflow = actual.slice(expected.length);
  const passed = index < activeIndex;

  return (
    <WordWrapper>
      <>
        {expected.split("").map((char, index) => (
          <Letter
            expected={char}
            actual={actual[index]}
            active={index < actual.length}
            wordPassed={passed}
            key={`${id}-letter-${index}`}
          />
        ))}
      </>
      <>
        {overflow &&
          overflow
            .split("")
            .map((char, index) => (
              <Letter
                expected={""}
                actual={char}
                active
                wordPassed={passed}
                key={`${id}-overflow-${index}`}
              />
            ))}
      </>
    </WordWrapper>
  );
};

export default Word;
