import React, { useState, useEffect } from "react";
import Slider, { Range } from "rc-slider";
import "rc-slider/assets/index.css";

import cx from "classnames";

export default function Timer({
  time,
  timeTotal,
  isEditing,
  isRunning,
  onChangeTimeTotal,
}) {
  const LONGEST_TIME = 60;

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
    height: "1px",
  };

  const timerProgressStyle = {
    backgroundColor: "var(--main)",
    height: "1px",
    transition: "width 1s linear",
  };
  const timerEditProgressStyle = {
    backgroundColor: "var(--main)",
    height: "1px",
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
            {Math.floor(time / 60)}:
            {(time % 60).toLocaleString("en-US", {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })}
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
          font-weight: bold;
          font-size: 18px;
          margin-left: 8px;
          color: var(--gray);
        }
      `}</style>
    </>
  );
}
