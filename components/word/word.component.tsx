import useCounter from "hooks/useCounter";
import useDidUpdateEffect from "hooks/useDidUpdateEffect";
import useIsomorphicLayoutEffect from "hooks/useIsomorphicLayoutEffect";
import { useOffset } from "hooks/useOffset";
import { useAtom, useSetAtom } from "jotai";
import { wordOffsetAtom } from "pages/test";
import React, { useEffect, useRef } from "react";
import { LetterProps, WordProps } from "./word.definition";
import { LetterSpan, WordWrapper } from "./word.style";

export const Letter = (props: LetterProps) => {
  const { expected, actual, active, wordPassed, wordPerfect } = props;

  const letter = expected ? expected : actual;
  const correct = expected === actual;
  const untyped = wordPassed && !correct && !actual;
  const overflow = expected === "";
  const untyped = wordPassed && !actual;

  let color = "lightgray";
  if (wordPerfect) color = "green";
  else if (active && correct) color = "black";
  else if (overflow || untyped) color = "pink";
  else if ((active && !correct) || overflow || untyped) color = "red";

  return (
    <LetterSpan
      color={color}
      expected={expected}
      actual={actual}
      showWrongLetter={!correct && !overflow}
    >
      {letter}
    </LetterSpan>
  );
};

const Word = React.memo((props: WordProps) => {
  const { expected, actual, id, passed, current, parentRef } = props;
  const { count, increment } = useCounter(0);
  const perfect = expected === actual && count === expected.length && passed;

  const ref = useRef(null);
  const offset = useOffset(parentRef, ref);

  const setWordOffset = useSetAtom(wordOffsetAtom);

  useDidUpdateEffect(() => {
    increment();
  }, [actual]);

  useIsomorphicLayoutEffect(() => {
    if (current) setWordOffset(offset);
  }, [current, offset]);

  const overflow = actual.slice(expected.length);
  const passed = index < activeIndex;

  return (
    <WordWrapper ref={ref}>
      <>
        {expected.split("").map((char, index) => (
          <Letter
            expected={char}
            actual={actual[index]}
            active={index < actual.length}
            wordPassed={passed}
            wordPerfect={perfect}
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
});

export default Word;
