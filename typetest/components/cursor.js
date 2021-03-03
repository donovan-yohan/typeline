import React, { useEffect, useRef, useState } from "react";

export default function Cursor(props) {
  const typingField = useRef(null);
  const [typedText, setTypedText] = useState("");

  let handleTextTyped = () => {
    props.onTextTyped(typingField.current.value);
  };

  useEffect(() => {
    typingField.current.focus();
  }, []);

  return (
    <div>
      <span className={"cursor"}></span>
      <textarea ref={typingField} onChange={handleTextTyped}></textarea>
      <style jsx>{`
        div {
          position: absolute;
          z-index: 1;
        }
        span,
        input {
          font-size: 1.33em;
          line-height: 2em;
        }
        .cursor {
          animation: blink 1s infinite;
          position: relative;
        }
        .cursor::after {
          content: "";
          position: absolute;
          bottom: 1px;
          height: 90%;
          width: 1.5px;
          background-color: black;
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
