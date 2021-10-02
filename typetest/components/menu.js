import React, { useContext, useRef, useState } from "react";
import Timer from "./timer.js";
import cx from "classnames";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";
import copyTextToClipboard from "../utils/copyToClipboard.js";
import ReactTooltip from "react-tooltip";
import Context from "./context.js";
import useHover from "../hooks/useHover.js";

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
  const [settings, setSettings] = useState([
    { name: "Capitals" },
    {
      hasCapitals: false,
      hasPunctuation: false,
      hasNumbers: false,
      hasSymbols: false,
    },
  ]);
  const [url, setUrl] = useState("");
  const [hoverCopyLink, isHoverCopyLink] = useHover([isFinished]);

  useDidUpdateEffect(() => {
    setUrl(window.location.href);
  }, [seed]);

  const customizeText = isEditing ? "Save" : "Customize";

  const noEditMenuButtonText = isRunning ? "Restart" : "New Test";
  const menuButtonClassList = cx({
    labelStyle: true,
    fadedButton: isRunning,
    activeButton: !isRunning,
  });

  const urlClassList = cx({
    urlHover: isHoverCopyLink,
  });

  const handleCustomizeClick = (e) => {
    if (!isRunning) {
      if (isEditing) {
        onUpdateEditingState(false);
      } else {
        onUpdateEditingState(true);
      }
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
      {isFinished && (
        <div className={`urlWrapper label`}>
          <span className={`urlRoot ${urlClassList}`}>
            {window.location.host}/
          </span>
          <span className={`urlHash ${urlClassList}`}>
            {window.location.hash}
          </span>
        </div>
      )}
      {isEditing && (
        <div className={"wordSettingsWrapper"}>
          {settings.map((setting) => {
            <label>
              <input
                type='checkbox'
                name={settings}
                checked={settings.hasCapitals}
                onClick={() => flipSetting("hasCapitals")}
              />
              <span className={"checkmark"} />
              Capitals
            </label>;
          })}
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
            <span className={"checkmark"} />
            <input
              type='checkbox'
              name='hasPunctuation'
              checked={settings.hasPunctuation}
              onClick={() => flipSetting("hasPunctuation")}
            />
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
        {/* {!isRunning && !isFinished && (
          <div className='buttonContainer'>
            <button
              onClick={() => {
                handleCustomizeClick();
              }}
              className={menuButtonClassList}
            >
              {customizeText}
            </button>
          </div>
        )} */}
        <div className='buttonContainer'>
          <button
            onClick={() => {
              if (isRunning) {
                newTest(seed.seed, seed.time);
              } else {
                newTest(undefined, seed.time);
              }
            }}
            className={menuButtonClassList}
          >
            {noEditMenuButtonText}
          </button>
        </div>
        {isFinished && (
          <div className='buttonContainer'>
            <button
              onClick={() => {
                newTest(seed.seed, seed.time);
              }}
              className={menuButtonClassList}
            >
              Retry
            </button>
          </div>
        )}
        {isFinished && (
          <div ref={hoverCopyLink} className='buttonContainer'>
            <button
              data-tip
              data-for='copyTip'
              onClick={() => {
                copyTextToClipboard(url);
              }}
              className={`${menuButtonClassList}`}
            >
              Copy Link
            </button>
            <ReactTooltip
              className={"toolTipWrapper"}
              id='copyTip'
              place={"top"}
              effect={"solid"}
              backgroundColor={theme.values.tooltipColour}
              textColor={theme.values.main}
              event={"click"}
              eventOff={"mouseleave"}
            >
              <p>Link copied!</p>
            </ReactTooltip>
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
                Try changing the seed after the # in the url and see how it
                affects the test. UI for customizing coming soon!
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
        }
        .buttonContainer {
          margin: 64px 64px 0 0;
          color: var(--highlight);
        }
        button {
          z-index: 1;
          position: relative;
          font-size: 1em;
          outline: none;
          background: none;
          border: none;
          padding: 4px 2px;
          transition: 0.3s cubic-bezier(0.27, 0.01, 0, 0.99);
          cursor: pointer;
          white-space: nowrap;
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
         {
          /* TODO: refactor animation into global use cause im dumb and copied it into the Logo.js too zzz */
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
          width: 2px;
          left: 94%;
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

        .urlWrapper:hover,
        .urlWrapper:hover .url,
        .copyLinkButton:hover + .urlRoot,
        .copyLinkButton:hover > .urlRoot {
          color: var(--highlight);
        }

        .urlWrapper {
          align-self: flex-end;
          display: flex;
        }

        .urlHash,
        .urlRoot {
          display: inline-block;
          transition: color 0.3s cubic-bezier(0.27, 0.01, 0, 0.99);
        }
        .urlHash {
          display: inline-block;
          color: var(--main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 33vw;
        }

        .urlRoot {
          color: var(--mainFaded);
        }

        .urlHover {
          color: var(--highlight);
        }

        .wordSettingsWrapper {
          display: flex;
          margin-top: 64px;
        }

        .wordSettingsWrapper label {
          display: flex;
          margin-right: 64px;
          position: relative;
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
