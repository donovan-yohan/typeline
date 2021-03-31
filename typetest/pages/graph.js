import Head from "next/head";
import React, { useState, useEffect, useRef, useReducer } from "react";
import styles from "../styles/Home.module.css";

import Word from "../components/word.js";
import Cursor from "../components/cursor.js";
import Menu from "../components/menu.js";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";
import useInterval from "@use-it/interval";
import generateWords from "../utils/generateWords.js";
import { calculateRawWPM, calculateTrueWPM } from "../utils/wpmUtils.js";
import createTextDatabase from "../utils/createTextDatabase.js";
import { useOffset } from "../hooks/useOffset.js";

const testData = [];
// polling rate of graph
const INTERVAL = 10;

// total ms value
const TOTAL_TIME = 30000;

const getPath = (line) => {
  return (
    "M " +
    line
      .map((p) => {
        return `${p.time} ${p.wpm}`;
      })
      .join(" L ")
  );
};

const getRndInteger = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export default function Home() {
  const [data, setData] = useState(testData);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const timelineRef = useRef(null);

  const addData = (array, time, value) => {
    let timeValue = (time / TOTAL_TIME) * timelineRef.current.clientWidth;

    array.push({ time: timeValue, wpm: value });
  };

  useInterval(
    () => {
      let newData = data;
      const startValue = 100;
      let value = startValue;
      if (newData.length > 0) {
        value = newData[newData.length - 1].wpm;
        value += getRndInteger(
          -1 * (value / startValue),
          1 * (value / startValue)
        );
      }
      addData(newData, time, value);
      setData(newData);
      setTime((time) => time + INTERVAL);
    },
    isRunning ? INTERVAL : null
  );

  useEffect(() => {
    if (time > TOTAL_TIME) setIsRunning(false);
  }, [time]);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div ref={timelineRef} className={"container"}>
        <svg className={"graphWrapper"}>
          <path className={"path"} d={getPath(data)} />;
        </svg>
      </div>
      <div>{time}</div>
      <style jsx>{`
        .container {
          margin: auto;
          width: 800px;
          border: 1px solid black;
          margin-top: 250px;
        }
        .path {
          fill: none;
          stroke-width: 1px;
          stroke: black;
          stroke-linejoin: round;
          stroke-linecap: round;
        }

        .graphWrapper {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
