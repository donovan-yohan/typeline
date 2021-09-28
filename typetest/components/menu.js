import React, { useContext, useRef, useState } from "react";
import Timer from "./timer.js";
import cx from "classnames";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";
import copyTextToClipboard from "../utils/copyToClipboard.js";
import ReactTooltip from "react-tooltip";
import Context from "./context.js";

export default function Menu({
  isFinished,
  isRunning,
  time,
  timeTotal,
  onChangeTimeTotal,
  options,
  isEditing,
  onUpdateEditingState,
  newTest,
  seed,
}) {
  const theme = useContext(Context);
  const urlRef = useRef(null);
  const [settings, setSettings] = useState({
    hasCapitals: false,
    hasPunctuation: false,
    hasNumbers: false,
    hasSymbols: false,
  });
  const [url, setUrl] = useState("");

  useDidUpdateEffect(() => {
    setUrl(window.location.href);
  }, [seed]);

  const menuButtonText = isRunning
    ? "Refresh"
    : isEditing
    ? "Save"
    : "Customize";

  const noEditMenuButtonText = isRunning ? "Restart" : "New Test";
  const menuButtonClassList = cx({
    labelStyle: true,
    fadedButton: isRunning,
    activeButton: !isRunning,
  });

  const handleMenuClick = (e) => {
    if (!isRunning) {
      // toggle customize menu
      onUpdateEditingState((isEditing) => !isEditing);
    }
  };

  const flipSetting = (setting) => {
    if (settings[setting] === undefined) {
      throw new Error("unknown setting parameter flipped");
    }
    setSettings((s) => ({
      ...s,
      [setting]: !s[setting],
    }));
  };

  return (
    <div className={"container"}>
      {!isFinished && (
        <Timer
          time={timeTotal - time}
          timeTotal={timeTotal}
          isEditing={isEditing}
          isRunning={isRunning}
          onChangeTimeTotal={onChangeTimeTotal}
        />
      )}
      {isFinished && <div>{/* add stuff for share/screenshot */}</div>}
      {isEditing && (
        <div className={"wordSettingsWrapper"}>
          <label>
            <input
              type='checkbox'
              name='hasCapitals'
              checked={settings.hasCapitals}
              onClick={() => flipSetting("hasCapitals")}
            />
            <span className={"checkmark"} />
            Capitals
          </label>

          <label>
            <input
              type='checkbox'
              name='hasPunctuation'
              checked={settings.hasPunctuation}
              onClick={() => flipSetting("hasPunctuation")}
            />
            <span className={"checkmark"} />
            Punctuation
          </label>

          <label>
            <input
              type='checkbox'
              name='hasNumbers'
              checked={settings.hasNumbers}
              onClick={() => flipSetting("hasNumbers")}
            />
            <span className={"checkmark"} />
            Numbers
          </label>
          <label>
            <input
              type='checkbox'
              name='hasSymbols'
              checked={settings.hasSymbols}
              onClick={() => flipSetting("hasSymbols")}
            />
            <span className={"checkmark"} />
            Symbols
          </label>
        </div>
      )}
      <div className={"buttonWrapper"}>
        <button
          onClick={() => {
            if (isRunning) {
              newTest(seed.seed, seed.time);
            } else {
              newTest();
            }
          }}
          className={menuButtonClassList}
        >
          {noEditMenuButtonText}
        </button>
        {isFinished && (
          <button
            onClick={() => {
              newTest(seed.seed, seed.time);
            }}
            className={menuButtonClassList}
          >
            Retry
          </button>
        )}
        {isFinished && (
          <div className='copyUrlWrapper'>
            <button
              onClick={() => {
                urlRef.current.select();
                copyTextToClipboard(url);
              }}
              className={`${menuButtonClassList} copyLinkButton`}
            >
              Copy Link
            </button>
            <span className={"urlWrapper"}>
              <input
                ref={urlRef}
                value={url}
                className={"url"}
                onClick={(e) => {
                  e.target.select();
                }}
              />
            </span>
            <span className={"toolTipIcon"} data-tip data-for='urlTip'>
              ?
            </span>
            <ReactTooltip
              className={"toolTipWrapper"}
              id='urlTip'
              place={"top"}
              effect={"solid"}
              backgroundColor={theme.values.tooltipColour}
              textColor={theme.values.main}
            >
              <p>Every unique url will generate the same test every time.</p>
              <p> Share it with your friends and see who can do it better!</p>
              <p>
                Try your own code and see how the test changes. UI for
                customizing coming soon!
              </p>
            </ReactTooltip>
          </div>
        )}
      </div>
      {/* <button onClick={handleMenuClick} className={menuButtonClassList}>
        {menuButtonText}
      </button> */}
      <style jsx>{`
        .container {
          display: flex;
          width: 100%;
          flex-direction: column;
        }

        .buttonWrapper {
          display: flex;
          justify-content: center;
        }

        button {
          z-index: 1;
          position: relative;
          font-size: 1em;
          outline: none;
          background: none;
          border: none;
          margin: 32px 32px 0;
          padding: 4px;
          transition: 0.3s cubic-bezier(0.27, 0.01, 0, 0.99);
          cursor: pointer;
        }
        button:before {
          z-index: -1;
          transition: 0.3s cubic-bezier(0.27, 0.01, 0, 0.99);
          display: inline-block;
          position: absolute;
          left: 0;
          bottom: 0;
          content: "";
          width: 0px;
          height: 100%;
        }
        button:hover:before {
          width: 98%;
        }
        button:after {
          transition: 0.3s cubic-bezier(0.27, 0.01, 0, 0.99);
          display: inline-block;
          position: absolute;
          left: 0;
          bottom: 0;
          content: "";
          width: 0px;
          height: 100%;
          background-color: var(--background);
        }
        button:hover:after {
          width: 3px;
          left: 92%;
          animation: 0.45s cubic-bezier(0.9, 0, 0, 0.9) 0.45s infinite alternate
            blink;
        }

        button:active {
          opacity: 0.75;
        }
        .fadedButton {
          color: var(--gray);
        }
        .fadedButton:before {
          background-color: var(--gray);
        }
        .fadedButton:hover {
          color: var(--background);
        }

        .activeButton {
          color: var(--highlight);
        }
        .activeButton:before {
          background-color: var(--highlight);
        }
        .activeButton:hover {
          color: var(--background);
        }

        .wordSettingsWrapper {
          display: flex;
          margin-top: 64px;
        }

        .urlWrapper {
          transition: 0.3s cubic-bezier(0.27, 0.01, 0, 0.99);
          margin-left: -16px;
          margin-right: 4px;
          border: solid 1px var(--gray);
          padding: 8px 16px;
          border-radius: 4px;
          background-color: var(--tooltipColour);
          line-height: 1;
        }

        .url {
          transition: 0.3s cubic-bezier(0.27, 0.01, 0, 0.99);
          display: inline-block;
          color: var(--gray);
          background-color: transparent;
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 400;
          font-family: "Roboto";
        }

        .urlWrapper:hover,
        .urlWrapper:hover .url,
        .copyLinkButton:hover ~ .urlWrapper,
        .copyLinkButton:hover ~ .urlWrapper .url {
          color: var(--main);
          border-color: var(--main);
        }

        .copyLinkButton ~ .urlWrapper label {
          display: flex;
          align-items: center;
          position: relative;
          padding-left: 32px;
          margin-right: 32px;
          cursor: pointer;
          font-size: 18px;
          user-select: none;
        }

        input[type="checkbox"] {
          position: absolute;
          opacity: 0;
          cursor: pointer;
          height: 0;
          width: 0;
        }

        /* Create a custom checkbox */
        .checkmark {
          position: absolute;
          left: 0;
          height: 15px;
          width: 15px;
          background-color: var(--gray);
          transition: all 0.2s ease;
        }

        /* On mouse-over, add a grey background color */
        label:hover input ~ .checkmark {
          opacity: var(--fade);
        }

        /* When the checkbox is checked, add a blue background */
        label input:checked ~ .checkmark {
          background-color: var(--highlight);
        }

        @keyframes blink {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
