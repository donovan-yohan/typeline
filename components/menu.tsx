import React, { LegacyRef, useContext, useState } from "react";
import Timer from "./timer.js";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";
import copyTextToClipboard from "../utils/copyToClipboard.js";
import ReactTooltip from "react-tooltip";
import Context from "./context";
import useHover from "../hooks/useHover.js";
import { generateSeed, TestInfo } from "utils/getSeedAndTime";
const cx = require("classnames");

enum SettingsTypes {
  HAS_CAPITALS = "hasCapitals",
  HAS_NUMBERS = "hasNumbers",
  HAS_PUNCTUATION = "hasPunctuation",
  HAS_SYMBOLS = "hasSymbols",
  WORD_LENGTH_RANGE = "wordLengthRange",
}

interface Settings {
  [SettingsTypes.HAS_CAPITALS]: boolean;
  [SettingsTypes.HAS_NUMBERS]: boolean;
  [SettingsTypes.HAS_PUNCTUATION]: boolean;
  [SettingsTypes.HAS_SYMBOLS]: boolean;
  [SettingsTypes.WORD_LENGTH_RANGE]: [number, number];
}

interface Props {
  isFinished: boolean;
  isRunning: boolean;
  time: number;
  timeTotal: number;
  onChangeTimeTotal: React.Dispatch<React.SetStateAction<number>>;
  isEditing: boolean;
  onUpdateEditingState: React.Dispatch<React.SetStateAction<boolean>>;
  newTest: (seed: string, time: number) => void;
  seed: TestInfo;
  className?: string;
}
export default function Menu({
  isFinished,
  isRunning,
  time,
  timeTotal,
  onChangeTimeTotal,
  isEditing,
  newTest,
  seed,
}: Props) {
  const theme = useContext(Context);
  const [settings, setSettings] = useState<Settings>({
    hasCapitals: false,
    hasPunctuation: false,
    hasNumbers: false,
    hasSymbols: false,
    wordLengthRange: [0, 6],
  });
  const [url, setUrl] = useState("");
  const [hoverCopyLink, isHoverCopyLink] = useHover([isFinished]);

  useDidUpdateEffect(() => {
    setUrl(window.location.href);
  }, [seed]);

  const noEditMenuButtonText = isRunning ? "Restart" : "New Test";
  const menuButtonClassList = cx({
    labelStyle: true,
    fadedButton: isRunning,
    activeButton: !isRunning,
  });

  const urlClassList = cx({
    urlHover: isHoverCopyLink,
  });

  const flipSetting = (setting: SettingsTypes) => {
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
          <label>
            <input
              type='checkbox'
              name={SettingsTypes.HAS_CAPITALS}
              checked={settings.hasCapitals}
              onClick={() => flipSetting(SettingsTypes.HAS_CAPITALS)}
            />
            <span className={"checkmark"} />
            Capitals
          </label>

          <label>
            <span className={"checkmark"} />
            <input
              type='checkbox'
              name={SettingsTypes.HAS_PUNCTUATION}
              checked={settings.hasPunctuation}
              onClick={() => flipSetting(SettingsTypes.HAS_PUNCTUATION)}
            />
            Punctuation
          </label>

          <label>
            <input
              type='checkbox'
              name={SettingsTypes.HAS_NUMBERS}
              checked={settings.hasNumbers}
              onClick={() => flipSetting(SettingsTypes.HAS_NUMBERS)}
            />
            <span className={"checkmark"} />
            Numbers
          </label>
          <label>
            <input
              type='checkbox'
              name={SettingsTypes.HAS_SYMBOLS}
              checked={settings.hasSymbols}
              onClick={() => flipSetting(SettingsTypes.HAS_SYMBOLS)}
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
                newTest(generateSeed(), seed.time);
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
          <div
            ref={hoverCopyLink as LegacyRef<HTMLDivElement>}
            className='buttonContainer'
          >
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
              event={"mousedown"}
              eventOff={"mouseleave"}
            >
              <p>Link copied!</p>
            </ReactTooltip>
            <div className={"buttonTooltip"}>
              <span className={"toolTipIcon"} data-tip data-for='urlTip'>
                ?
              </span>
            </div>
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
          display: flex;
          margin: 64px 64px 0 0;
          color: var(--highlight);
        }
        .buttonTooltip {
          padding: 3px 3px 3px 0;
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
