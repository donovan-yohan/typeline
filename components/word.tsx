import React, { useRef, useEffect, useState } from "react";
import Letter from "./letter";

import {
  CursorSetLetterRefPayload,
  HighlightActionType,
  HighlightSetWordRefPayload
} from "./reducers";
import { LetterType, WordState } from "interfaces/typeline";
import { getTextTypedString } from "utils/cursorUtils";
interface Props {
  id: number;
  active: boolean;
  activeLetterIndex: number;
  letters: LetterType[];
  wordState: WordState;
  onLetterUpdate: React.Dispatch<CursorSetLetterRefPayload>;
  onWordUpdate: React.Dispatch<HighlightSetWordRefPayload>;
  finished: boolean;
}

export default React.memo(function Word({
  id,
  active,
  activeLetterIndex,
  letters,
  wordState,
  onLetterUpdate,
  onWordUpdate
}: Props) {
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isPerfect, setIsPerfect] = useState<boolean>(false);
  const wordRef = useRef(null);

  useEffect(() => {
    if (active) {
      onWordUpdate({
        type: HighlightActionType.UPDATE,
        wordRef: wordRef,
        isValid: wordState === WordState.INCORRECT ? false : true
      });
    }
  }, [active, activeLetterIndex]);

  useEffect(() => {
    switch (wordState) {
      case WordState.UNVISITED || WordState.CORRECT:
        setIsCorrect(true);
        setIsPerfect(false);
        break;
      case WordState.PERFECT:
        setIsCorrect(true);
        setIsPerfect(true);
        break;
      case WordState.INCORRECT:
        setIsCorrect(false);
        setIsPerfect(false);
        break;
      default:
        break;
    }
  }, [wordState]);

  return (
    <span className={"wordWrapper"}>
      <span ref={wordRef} className={"word"}>
        <span>
          {letters.map((letter, i) => {
            return (
              <Letter
                id={i}
                wordId={id}
                wordString={getTextTypedString(letters)}
                wordState={wordState}
                isActive={active}
                letter={letter}
                onLetterUpdate={onLetterUpdate}
                isPerfect={isPerfect}
                isCorrect={isCorrect}
                key={`${id}-CHAR-${i}`}
              />
            );
          })}
        </span>
      </span>

      <style jsx>{`
        .word {
          font-size: 2.65em;
          letter-spacing: 0.02em;
          line-height: 2.1;
          white-space: pre;
          user-select: none;
          position: relative;
          margin-right: 0.5em;
        }
      `}</style>
    </span>
  );
});
