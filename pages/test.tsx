import Word from "components/word/word.component";
import React, { SyntheticEvent, useEffect, useState } from "react";

const expectedString = "The quick brown fox jumps over the lazy dog";

export default function Test() {
  const [inputString, setInputString] = useState("");

  useEffect(() => {
    console.log(getCurrentInput(inputString));
    console.log(getCurrentExpected(expectedString, inputString));
  }, [inputString]);

  const getCurrentInput = (actual: string): string => {
    const actualArray = actual.split(" ");
    const [currentActualWord] = actualArray.slice(-1);

    return currentActualWord;
  };

  const getCurrentExpected = (expected: string, actual: string): string => {
    const actualArray = actual.split(" ");
    const currentExpectedIndex = actualArray.length - 1;
    const currentExpectedWord = expected.split(" ")[currentExpectedIndex];

    return currentExpectedWord;
  };

  const visualString = (expected: string, actual: string) => {
    return expected
      .split("")
      .map<React.ReactNode>((char, index) => {
        if (index > actual.length - 1) {
          return <span style={{ color: "lightgray" }}>{char}</span>;
        } else if (char === actual[index]) {
          return (
            <span key={index} style={{ color: "green" }}>
              {char}
            </span>
          );
        } else {
          return (
            <span key={index} style={{ color: "red", textDecoration: "underline" }}>
              {actual[index]}
            </span>
          );
        }
      })
      .reduce((prev, curr) => [prev, curr]);
  };

  const onSelect = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    input.selectionStart = input.selectionEnd;
  };

  const handleInputChange = (e: SyntheticEvent) => {
    const input = e.target as HTMLInputElement;
    const len = input.value.length;
    const value = input.value.charAt(len - 1);

    if (len === 1) {
      // Handle first button press
      if (value === " ") return;
    } else if (len > 1 && value === " ") {
      // Reject multiple spaces
      if (input.value[len - 2] === " ") return;

      // MacOS autopunctuate fix
      //   if (input.value[len - 2] === ".") return;

      // Handle space
    }
    setInputString(input.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key.length > 1 && e.key != "Backspace") e.preventDefault();
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const input = e.target as HTMLInputElement;
    input.focus();
  };

  return (
    <div>
      <input
        value={inputString}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        onSelect={onSelect}
        onMouseDown={onMouseDown}
      />
      {expectedString.split(" ").map((expected, index) => {
        const actualWord = inputString.split(" ")[index];
        return (
          <>
            <Word
              actual={actualWord || ""}
              expected={expected}
              key={`word-${index}`}
              id={`word-${index}`}
            />
          </>
        );
      })}
      <div></div>
    </div>
  );
}
