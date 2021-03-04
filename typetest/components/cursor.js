import React, { useEffect, useRef, useState } from "react";

export default function Cursor(props) {
  const typingField = useRef(null);
  const [typedText, setTypedText] = useState("");
  const [displaceString, setDisplaceString] = useState("");

  let handleTextTyped = () => {
    setDisplaceString(typingField.current.value);
    props.onTextTyped(typingField.current.value);
  };

  let focusTextField = () => {
    console.log("focused");
    typingField.current.focus();
    let temp = typingField.current.value;
    typingField.current.value = "";
    typingField.current.value = temp;
  };

  useEffect(() => {
    typingField.current.focus();
  });

  return (
    <div>
      <p className={"cursorPlacement"} onClick={focusTextField}>
        <span className={"cursor"}></span>
      </p>

      <textarea
        ref={typingField}
        onChange={handleTextTyped}
        onClick={focusTextField}
      ></textarea>
      <style jsx>{`
        div {
          position: absolute;
          z-index: 99;
        }

        p,
        textarea {
          max-width: 50vw;
          font-size: 1.33em;
          line-height: 2em;
          margin: 0;
          user-select: none;
        }
        .cursor {
          color: black;
          animation: blink 1s infinite;
          position: relative;
        }
        .cursor::after {
          content: "|";

          position: absolute;
          left: -2px;
        }
        .cursorPlacement {
          max-width: 50vw;
          white-space: pre-wrap;
        }

        textarea {
          position: absolute;
          overflow: hidden;
          top: 0;
          z-index: 999;
          opacity: 0;
          font-family: Roboto;
          padding: 0;
          border: none;
          width: 50vw;
          height: 25vh;
          outline: none;
          resize: none;
          background-color: transparent;
        }

        @keyframes blink {
          50% {
            opacity: 1;
          }
          60% {
            opacity: 0;
          }
          90% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
