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
    typingField.current.focus();
  };

  useEffect(() => {
    typingField.current.focus();
  });

  return (
    <div>
      <p className={"cursorPlacement"} onClick={focusTextField}>
        {displaceString}
        <span className={"cursor"}></span>
      </p>

      <textarea ref={typingField} onChange={handleTextTyped}></textarea>
      <style jsx>{`
        div {
          position: absolute;
          z-index: 999;
        }

        p {
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
          color: transparent;
          white-space: pre-wrap;
        }

        textarea {
          z-index: 999;
          opacity: 0;
          font-family: Roboto;
          padding: 0;
          border: none;
          width: 0;
          height: 0;
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
