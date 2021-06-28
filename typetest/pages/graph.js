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

const testData = [
  { time: 0, wpm: 0 },
  { time: 25, wpm: 50 },
  { time: 50, wpm: 60 },
  { time: 60, wpm: 175 },
];

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

export default function Home() {
  const [data, setData] = useState(testData);

  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div>
        <svg>
          <path className={"path"} d={getPath(data)} />;
        </svg>
      </div>
      <style jsx>{`
        .path {
          fill: none;
          stroke-width: 1px;
          stroke: black;
          stroke-linejoin: round;
          stroke-linecap: round;
        }
      `}</style>
    </div>
  );
}
