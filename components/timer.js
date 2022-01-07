import React, { useState, useEffect, useContext } from "react";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

import cx from "classnames";
import { formatTime } from "../utils/formatTime";
import ReactTooltip from "react-tooltip";
import Context from "./context";
import { PUNCTUATION_TABLE, SYMBOL_TABLE } from "../utils/getSeedAndTime";
import Tooltip from "./tooltip";

export default function Timer({
  time,
  timeTotal,
  isEditing,
  isRunning,
  onChangeTimeTotal,
}) {
  const LONGEST_TIME = 60;
  const theme = useContext(Context);

  const handleTimeTotalChange = (newTime) => {
    onChangeTimeTotal(newTime);
  };

  const timerRunningStyle = {
    opacity: 0,
    borderRadius: 0,
    backgroundColor: "var(--highlight)",
    border: 0,
    width: "25px",
    height: "25px",
    marginTop: "-12px",
    transition: "all 0.75s ease",
    pointerEvents: "none",
  };
  const timerEditStyle = {
    opacity: 1,
    borderRadius: 0,
    backgroundColor: "var(--highlight)",
    border: 0,
    width: "15px",
    height: "15px",
    marginTop: "-7px",
    transition: "all 0.75s ease",
  };

  const timerBackgroundStyle = {
    backgroundColor: "var(--gray)",
    opacity: "var(--fade)",
    height: "2px",
  };

  const timerProgressStyle = {
    backgroundColor: "var(--main)",
    height: "2px",
    transition: "width 1s linear",
  };
  const timerEditProgressStyle = {
    backgroundColor: "var(--main)",
    height: "2px",
    transition: "width 0.75s ease",
  };

  const labelStyle = {
    fontFamily: "Roboto",
    fontSize: "18px",
    fontWeight: "bold",
    color: "var(--main)",
    opacity: 1,
    transition: "opacity 0.75s ease",
  };

  return (
    <>
      <div className={"container"}>
        <>
          <Slider
            style={{
              margin: "16px 0",
            }}
            value={time}
            min={0}
            max={isEditing ? LONGEST_TIME : timeTotal}
            trackStyle={isRunning ? timerProgressStyle : timerEditProgressStyle}
            handleStyle={isEditing ? timerEditStyle : timerRunningStyle}
            railStyle={timerBackgroundStyle}
            dotStyle={{ opacity: 0 }}
            onChange={handleTimeTotalChange}
            marks={
              isEditing
                ? {
                    10: {
                      label: "0:10",
                      style: labelStyle,
                    },
                    30: {
                      label: "0:30",
                      style: labelStyle,
                    },
                    60: {
                      label: "1:00",
                      style: labelStyle,
                    },
                  }
                : {}
            }
          />
        </>
        {!isEditing && (
          <span className={"time"}>
            {formatTime(time)}
            <Tooltip
              placement={"left"}
              backgroundColor={theme.values.tooltipColour}
              fontColor={theme.values.main}
              opacity={0.9}
            >
              <p>
                The test is generated from the <code>/#/seed/test_length</code>{" "}
                in the url. Each seed creates the same test every time!
              </p>
              <p>
                <code>time</code> can be any value between 1 and 120
              </p>
              <p>
                The <code>seed</code> will generate different tests depending on
                its contents. Including each of the following in the seed will
                change it in the following way:
              </p>
              <table className='tooltipTable'>
                <tr>
                  <td>
                    <code>CAPITALS</code>
                  </td>
                  <td>will add Capital Letters</td>
                </tr>
                <tr>
                  <td>
                    <code>1234567890</code>
                  </td>
                  <td>will add numbers</td>
                </tr>
                <tr>
                  <td>
                    <code>
                      {PUNCTUATION_TABLE.reduce((acc, p) => {
                        return (acc += p.char);
                      }, "")}
                    </code>
                  </td>
                  <td>will add those punctuation</td>
                </tr>
                <tr>
                  <td>
                    <code>
                      {SYMBOL_TABLE.reduce((acc, p) => {
                        return (acc += p.char);
                      }, "")}
                    </code>
                  </td>
                  <td>will add special characters</td>
                </tr>
                <tr>
                  <td>
                    <code>seedLongerThan10</code>
                  </td>
                  <td>will add long words</td>
                </tr>
              </table>
              <p>
                Example with all options enabled <br />
                <code>/#/ABCD-1234.EFGH/15</code>
              </p>
              <p>UI for all of this coming soon!</p>
            </Tooltip>
          </span>
        )}
      </div>
      <style jsx>{`
        .container {
          display: flex;
          width: 100%;
          align-items: center;
        }

        .time {
          display: flex;
          align-items: center;
          font-weight: bold;
          font-size: 18px;
          margin-left: 8px;
          color: var(--gray);
        }

        .tooltipWrapper .tooltipTable {
        }
      `}</style>
    </>
  );
}
