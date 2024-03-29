import React from "react";

export default function Tooltip(props) {
  let arrowSize = props.arrowSize || 10;
  let arrowPadding = props.arrowPadding || 4;
  return (
    <div className='container'>
      <span className={"tooltipIcon"}>?</span>
      <div className={`tooltip ${props.placement}`}>{props.children}</div>
      <style jsx>{`
        .container {
          display: inline;
          position: relative;
          overflow: visible;
          user-select: none;
          margin-left: 0.5em;
        }
        .tooltipIcon {
          z-index: 9999;
          font-size: 0.75em;
          font-weight: bold;
          height: 100%;
          border: 2px solid;
          border-radius: 50%;
          letter-spacing: 0.49em;
          padding-left: 0.47em;
          transition: 0.25s ease-in-out;
          cursor: default;
          opacity: var(--fade);
          margin-bottom: 1em;
        }

        .tooltipIcon:hover {
          opacity: 1;
        }

        .tooltip {
          font-size: 14px;
          font-weight: normal;
          color: ${props.fontColor};
          width: 400px;
          opacity: 0;
          transition: 0.25s ease-in-out;
          position: absolute;
          border-radius: 4px;
          padding: 8px 20px;
        }
        .tooltip:before {
          display: inline;
          content: "";
          position: absolute;
          background-color: ${props.backgroundColor};
          border-radius: 4px;
          height: 100%;
          width: 400px;
          top: 0;
          left: 0;
          opacity: ${props.opacity};
          z-index: -1;
        }

        .left {
          transform: translateY(-50%)
            translateX(calc(-100% - ${arrowPadding}px));
          top: 15%;
          left: calc(0px - ${arrowSize}px - ${arrowPadding}px);
        }
        .left:after {
          content: "";
          max-width: 0;
          max-height: 0;
          border: ${arrowSize}px solid;
          border-color: transparent transparent transparent
            ${props.backgroundColor};
          position: absolute;
          right: calc(0px - ${arrowSize * 2}px);
          top: 50%;
          opacity: ${props.opacity};
        }

        .tooltipIcon:hover ~ .tooltip {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
