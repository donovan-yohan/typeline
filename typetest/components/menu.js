import React, { useState } from "react";
import Timer from "./timer.js";
import cx from "classnames";

export default function Menu({
  isFinished,
  isRunning,
  time,
  timeTotal,
  onChangeTimeTotal,
  options,
  isEditing,
  onUpdateEditingState
}) {
  const [settings, setSettings] = useState({
    hasCapitals: false,
    hasPunctuation: false,
    hasNumbers: false,
    hasSymbols: false,
  });


  const menuButtonText = isRunning
    ? "Refresh"
    : isEditing
    ? "Save"
    : "Customize";
  const menuButtonClassList = cx({
    labelStyle: true,
    refreshButton: isRunning,
    customizeButton: !isRunning,
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
              type="checkbox"
              name="hasCapitals"
              checked={settings.hasCapitals}
              onClick={() => flipSetting("hasCapitals")}
            />
            <span className={"checkmark"} />
            Capitals
          </label>

          <label>
            <input
              type="checkbox"
              name="hasPunctuation"
              checked={settings.hasPunctuation}
              onClick={() => flipSetting("hasPunctuation")}
            />
            <span className={"checkmark"} />
            Punctuation
          </label>

          <label>
            <input
              type="checkbox"
              name="hasNumbers"
              checked={settings.hasNumbers}
              onClick={() => flipSetting("hasNumbers")}
            />
            <span className={"checkmark"} />
            Numbers
          </label>
          <label>
            <input
              type="checkbox"
              name="hasSymbols"
              checked={settings.hasSymbols}
              onClick={() => flipSetting("hasSymbols")}
            />
            <span className={"checkmark"} />
            Symbols
          </label>
        </div>
      )}
      <button
        onClick={() => window.location.reload()}
        className={menuButtonClassList}
      >
        Refresh
      </button>
      {/* <button onClick={handleMenuClick} className={menuButtonClassList}>
        {menuButtonText}
      </button> */}
      <style jsx>{`
        .container {
          display: flex;
          width: 100%;
          flex-direction: column;
        }

        button {
          font-size: 1em;
          outline: none;
          background: none;
          border: none;
          margin-top: 32px;
          transition: all 0.5s ease;
        }
        button:active {
          opacity: 0.75;
        }
        .refreshButton {
          color: var(--gray);
        }
        .customizeButton {
          color: var(--highlight);
        }

        .wordSettingsWrapper {
          display: flex;
          margin-top: 64px;
        }

        label {
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
      `}</style>
    </div>
  );
}
