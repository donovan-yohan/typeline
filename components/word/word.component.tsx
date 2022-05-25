import React from "react";
import { LetterProps, WordProps } from "./word.definition";
import { LetterSpan, WordWrapper } from "./word.style";

export const Letter = (props: LetterProps) => {
  const { expected, actual, active } = props;

  const letter = expected ? expected : actual;
  const correct = expected === actual;
  const overflow = expected === "";

  let color = "lightgray";
  if (active && correct) color = "green";
  if ((active && !correct) || overflow) color = "red";

  return (
    <LetterSpan color={color} actual={actual} showWrongLetter={!correct && !overflow}>
      {letter}
    </LetterSpan>
  );
};

const Word = (props: WordProps) => {
  const { expected, actual, id } = props;

  const overflow = actual.slice(expected.length);

  return (
    <WordWrapper>
      <>
        {expected.split("").map((char, index) => (
          <Letter
            expected={char}
            actual={actual[index]}
            active={index < actual.length}
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
                key={`${id}-overflow-${index}`}
              />
            ))}
      </>
    </WordWrapper>
  );
};

export default Word;
