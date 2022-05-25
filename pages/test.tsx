import Word from "components/word/word.component";
import React, { SyntheticEvent, useState } from "react";

const expectedString = "The quick brown fox jumps over the lazy dog";

export default function Test() {
  const [inputString, setInputString] = useState("");

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
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div>
          {expectedString.split(" ").map((expected, index) => {
            const actualWordArray = inputString.split(" ");
            const actualWord = actualWordArray[index];
            return (
              <>
                <Word
                  index={index}
                  activeIndex={actualWordArray.length - 1}
                  actual={actualWord || ""}
                  expected={expected}
                  key={`word-${index}`}
                  id={`word-${index}`}
                />
              </>
            );
          })}
        </div>
        <input
          value={inputString}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onSelect={onSelect}
          onMouseDown={onMouseDown}
          style={{ marginTop: "64px" }}
        />
      </div>
    </div>
  );
}
