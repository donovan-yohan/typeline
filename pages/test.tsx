import styled from "@emotion/styled";
import Word from "components/word/word.component";
import { EmptyOffsetType, OffsetType } from "hooks/useOffset";
import { atom, useAtom } from "jotai";
import React, { SyntheticEvent, useEffect, useRef, useState } from "react";

interface KeypressType {
  key: string;
  timestamp: number;
}

interface HighlightProps {
  offset: OffsetType;
}

const keypressAtom = atom<KeypressType[]>([]);
export const wordOffsetAtom = atom<OffsetType>(EmptyOffsetType);
export const letterOffsetAtom = atom<OffsetType>(EmptyOffsetType);

const expectedString = "The quick brown fox jumps over the lazy dog";

const TextContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: relative;
  width: 400px;
`;

const HighlightStyled = styled.div<HighlightProps>`
  position: absolute;
  top: ${(props) => props.offset.top}px;
  left: ${(props) => props.offset.left}px;
  width: ${(props) => props.offset.right - props.offset.left}px;
  height: ${(props) => props.offset.bottom - props.offset.top}px;
  background-color: yellow;
  transition: all 0.15s ease-in-out;
`;

const Highlight = (props: HighlightProps): JSX.Element => <HighlightStyled {...props} />;

export default function Test() {
  const [inputString, setInputString] = useState("");
  const [keys, setKeys] = useAtom(keypressAtom);
  const [wordOffset] = useAtom(wordOffsetAtom);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(keys);
  }, [keys]);

  const onSelect = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    input.selectionStart = input.selectionEnd;
  };

  const handleInputChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    const len = input.value.length;
    const value = input.value.charAt(len - 1);

    if (inputString.length > len) {
      setInputString(input.value);
    } else {
      if (len === 1) {
        // Handle first button press
        if (value === " ") return;
      } else if (len > 1 && value === " ") {
        // Reject multiple spaces (and deal with MacOS auto punctuate)
        if (inputString[len - 2] === " ") return;

        // Handle space
      }
      setInputString((inputString) => inputString + value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key.length > 1 && e.key != "Backspace") e.preventDefault();
    else setKeys((keys) => [...keys, { key: e.key, timestamp: Date.now() }]);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    input.focus();
  };

  return (
    <div style={{ margin: "24px" }}>
      <input
        value={inputString}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onSelect={onSelect}
        onMouseDown={onMouseDown}
      />
      <TextContainer ref={ref}>
        <Highlight offset={wordOffset} />
        {expectedString.split(" ").map((expected, index) => {
          const actualWord = inputString.split(" ")[index];
          return (
            <Word
              id={`word-${index}`}
              actual={actualWord || ""}
              expected={expected}
              passed={index < inputString.split(" ").length - 1}
              current={index === inputString.split(" ").length - 1}
              key={`word-${index}`}
              parentRef={ref}
            />
          );
        })}
      </TextContainer>
    </div>
  );
}
