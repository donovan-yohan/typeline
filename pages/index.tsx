import Head from "next/head";
import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
  useCallback,
  LegacyRef
} from "react";
import ReactTooltip from "react-tooltip";
import { Transition } from "react-transition-group";
import Lottie from "lottie-react-web";
import themeAnimation from "../public/img/animations/darkmode.json";
import styles from "../styles/Home.module.scss";
import Word from "../components/word";
import Cursor from "../components/cursor";
import Menu from "../components/menu";
import PerformanceChart from "../components/performanceChart";
import useDidUpdateEffect from "../hooks/useDidUpdateEffect.js";
import useInterval from "@use-it/interval";
import { calculateRawWPM, calculateTrueWPM } from "../utils/wpmUtils";
import { isMobile } from "react-device-detect";
import {
  cursorReducer,
  initialCursorState,
  highlightReducer,
  initialHighlightState,
  textTypedReducer,
  Stats,
  TextTypedActionType,
  TextTypedInitPayload,
  EMPTY_WORD_TYPE
} from "../components/reducers";
import cleanSeed, { generateSeed, TestInfo } from "../utils/getSeedAndTime";
import Context from "../components/context";
import useEventListener from "../hooks/useEventListener";
import Logo from "../components/logo";
import useHover from "../hooks/useHover";
import { OffsetType } from "hooks/useOffset";
import { createTextDatabase } from "../utils/createTextDatabase";
import { getActiveLetterIndex } from "utils/cursorUtils";

export interface ChartStat {
  wpm: number;
  raw: number;
  correctRawAverage: number;
  allRawAverage: number;
  correctInInterval: number;
  incorrectInInterval: number;
  correctedInInterval: number;
  time: number;
  correctToTime: number;
  incorrectToTime: number;
  correctedToTime: number;
}

const DEFAULT_TIME = 30;
const FADE_DURATION = 150; // in ms

export default function Home() {
  const theme = useContext(Context);

  const [timeTotal, setTimeTotal] = useState(DEFAULT_TIME);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [chartStats, setChartStats] = useState<ChartStat[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [textTyped, textTypedDispatcher] = useReducer(textTypedReducer, [
    EMPTY_WORD_TYPE
  ]);

  // initial start up logic
  // {seed: String, time: int}
  const [seed, setSeed] = useState<TestInfo>({
    seed: generateSeed(),
    time: DEFAULT_TIME
  });

  // assign hash on first load
  useEffect(() => {
    let clean = cleanSeed(window.location.hash);
    if (clean.seed === "") clean.seed = generateSeed();
    setSeed(clean);
  }, []);

  // listen for hash change
  const hashChangeHandler = useCallback(() => {
    let clean = cleanSeed(window.location.hash);
    if (clean.seed === "") clean.seed = generateSeed();
    setSeed(clean);
  }, [setSeed]);
  useEventListener("hashchange", hashChangeHandler);

  // generate new words when hash changes
  useDidUpdateEffect(() => {
    // reset to original state
    setActiveWordIndex(0);
    setIsRunning(false);
    setFinished(false);
    setTime(0);
    setTimeTotal(seed.time);

    window.location.hash = "/" + seed.seed + "/" + seed.time;

    (async () => {
      const res = await fetch("/api/words", {
        method: "POST",
        body: JSON.stringify({ ...seed })
      });
      const json = await res.json();
      setIsResetting(false);
      let newTextDatabase = createTextDatabase(json.words);
      let payload: TextTypedInitPayload = {
        type: TextTypedActionType.INIT,
        textData: newTextDatabase
      };
      textTypedDispatcher(payload);
    })();
  }, [seed]);

  const newTest = (seed = generateSeed(), time = DEFAULT_TIME) => {
    setIsResetting(true);
    setTimeout(() => {
      setSeed({ seed, time });
    }, FADE_DURATION);
  };

  const [cursorState, cursorDispatcher] = useReducer(
    cursorReducer,
    initialCursorState
  );
  const [highlightState, highlightDispatcher] = useReducer(
    highlightReducer,
    initialHighlightState
  );
  const [lineOffset, setLineOffset] = useState<number>(0);

  const [stats, setStats] = useState<Stats>({
    correct: 0,
    incorrect: 0,
    corrected: 0
  });

  // Dynamic text height on zoom
  const [textPageHeight, setTextPageHeight] = useState("30vh");
  const [currentLineHeight, setCurrentLineHeight] = useState(89);
  useDidUpdateEffect(() => {
    if (!finished) {
      if (highlightState.wordRef) {
        let offsetNode = highlightState.wordRef.current
          ?.parentNode as HTMLElement | null;
        if (offsetNode) setCurrentLineHeight(offsetNode.clientHeight);
      }
    }
  }, [highlightState]);
  useEffect(() => {
    setTextPageHeight(currentLineHeight * 3 + "px");
  }, [currentLineHeight]);
  // --------------------------------------------------

  const paragraphRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const textPageRef = useRef<HTMLDivElement>(null);

  // TYPING LOGIC
  const handleWordChanged = (newActiveWordIndex: number) => {
    setActiveWordIndex(newActiveWordIndex);
  };

  const handleLineChange = (linePos: OffsetType) => {
    // magic value that compensates for highlight being different height from the whole line...
    // works assuming the highlight is centered in a word
    let relativeLineHeight = linePos.bottom + currentLineHeight / 2;
    let lineNum = Math.floor(relativeLineHeight / currentLineHeight) - 2;
    if (isRunning && lineNum > 0) {
      setLineOffset(-lineNum * currentLineHeight);
    } else {
      setLineOffset(0);
    }
  };

  // helper function to find change in values over time for graph
  const newStat = (
    lastStat: ChartStat,
    currentTime: number,
    correct: number,
    incorrect: number,
    corrected: number
  ): ChartStat => {
    return {
      wpm: calculateTrueWPM(
        stats.correct,
        stats.incorrect,
        stats.corrected,
        timeTotal - time,
        timeTotal
      ),
      raw: calculateRawWPM(
        correct + incorrect - lastStat.correctToTime - lastStat.incorrectToTime,
        lastStat.time,
        currentTime
      ),
      correctRawAverage: calculateRawWPM(
        correct - lastStat.correctToTime,
        lastStat.time,
        currentTime
      ),
      allRawAverage: calculateRawWPM(correct, 0, currentTime),
      correctInInterval: correct - lastStat.correctToTime,
      incorrectInInterval: incorrect - lastStat.incorrectToTime,
      correctedInInterval: corrected - lastStat.correctedToTime,
      time: currentTime,
      correctToTime: correct,
      incorrectToTime: incorrect,
      correctedToTime: corrected
    };
  };

  // COUNTER
  useInterval(
    () => {
      setTime((time) => time + 1);
    },
    isRunning ? 1000 : null
  );

  useEffect(() => {
    // update stats for graph/chart
    if (time == 1) {
      setChartStats([
        newStat(
          {
            wpm: 0,
            raw: 0,
            correctRawAverage: 0,
            allRawAverage: 0,
            correctInInterval: 0,
            incorrectInInterval: 0,
            correctedInInterval: 0,
            time: 0,
            correctToTime: 0,
            incorrectToTime: 0,
            correctedToTime: 0
          },
          time,
          stats.correct,
          stats.incorrect,
          stats.corrected
        )
      ]);
    } else if (time > 1) {
      setChartStats([
        ...chartStats,
        newStat(
          chartStats[time - 2],
          time,
          stats.correct,
          stats.incorrect,
          stats.corrected
        )
      ]);
    }

    // end test
    if (time >= timeTotal) {
      setIsRunning(false);
      setFinished(true);
      setTime(0);
    }
  }, [time]);

  // HANDLE INITIAL TEXT TYPED
  useDidUpdateEffect(() => {
    if (
      !isRunning &&
      textTyped[0].letters[0] &&
      textTyped[0].letters[0].received != ""
    )
      setIsRunning(true);
  }, [textTyped[0].letters[0]]);

  // CUSTOMIZE SETTINGS
  useEffect(() => {
    if (!isRunning) {
      setTime(0);
    }
  }, [time, timeTotal]);

  useEffect(() => {
    setIsRunning(false);
    setTime(0);
  }, [timeTotal]);

  // for theme toggle
  const [darkmodeRef, isDarkmodeHovered] = useHover();
  const themeMultiplier = theme.theme == "light" ? 1 : -1;

  return (
    <div ref={rootRef} className={styles.container}>
      <Head>
        <title>typeline Typing Test</title>
        <link rel='icon' href='/favicon.ico' />
        <link
          rel='apple-touch-icon'
          sizes='180x180'
          href='/apple-touch-icon.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='32x32'
          href='/favicon-32x32.png'
        />
        <link
          rel='icon'
          type='image/png'
          sizes='16x16'
          href='/favicon-16x16.png'
        />
        <link rel='manifest' href='/site.webmanifest' />
        <meta property='og:title' content='typeline Typing Test' />
        <meta
          property='og:description'
          content='A simple animated type test focused on encouraging and improving consistency and accuracy.'
        />
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://typeline.donovanyohan.com/' />
        <meta property='og:image' content='/img/og/ogimage.png' />
      </Head>

      <main className={styles.main}>
        <Transition in={!isRunning} timeout={500}>
          {(state) => (
            <div className={`${styles.header} header-${state}`}>
              <Logo
                colour={theme.values.gray}
                hoverColour={theme.values.highlight}
              />
              <Transition in={!finished} timeout={300}>
                {(state) => (
                  <div
                    className={`${styles.themeToggle} themeToggle-${state}`}
                    ref={darkmodeRef as LegacyRef<HTMLDivElement>}
                    onClick={() => {
                      theme.toggleTheme();
                    }}
                  >
                    <Lottie
                      options={{
                        animationData: themeAnimation,
                        autoplay: false,
                        loop: false
                      }}
                      height={30}
                      width={30}
                      direction={
                        (isDarkmodeHovered
                          ? 1 * themeMultiplier
                          : -1 * themeMultiplier) as 1 | -1
                      }
                    />
                  </div>
                )}
              </Transition>
            </div>
          )}
        </Transition>
        {!isMobile && (
          <div className={styles.textColumn}>
            <Transition in={!finished && !isResetting} timeout={0}>
              {(state) => (
                <div
                  ref={textPageRef}
                  className={`textPage textTransition-${state} ${
                    finished ? "textTransition-removed" : ""
                  }`}
                  style={{
                    maxHeight: `${textPageHeight}`,
                    minHeight: `${textPageHeight}`
                  }}
                  key={seed.toLocaleString()}
                >
                  <div
                    ref={paragraphRef}
                    className={styles.textFrame}
                    style={{ transform: `translateY(${lineOffset}px)` }}
                  >
                    <Cursor
                      onTextTyped={textTypedDispatcher}
                      onWordChanged={handleWordChanged}
                      wordRef={highlightState.wordRef}
                      letterRef={cursorState.letterRef}
                      paragraphRef={paragraphRef}
                      activeWordIndex={activeWordIndex}
                      textTyped={textTyped}
                      isFinished={finished}
                      isEditing={isEditing}
                      isRunning={isRunning}
                      isFirstChar={cursorState.isFirstChar}
                      onLineChange={handleLineChange}
                      textPageHeight={textPageHeight}
                      isValid={highlightState.isValid}
                    />
                    <div className={styles.textWrapper}>
                      {textTyped.map((word, i) => {
                        return (
                          <Word
                            id={i}
                            activeLetterIndex={
                              activeWordIndex === i
                                ? getActiveLetterIndex(word.letters)
                                : -1
                            }
                            wordState={word.state}
                            letters={word.letters}
                            active={activeWordIndex === i}
                            onLetterUpdate={cursorDispatcher}
                            onWordUpdate={highlightDispatcher}
                            finished={finished}
                            key={`WORD-${i}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </Transition>
            {finished && (
              <div className={styles.results}>
                <div className={styles.resultsWrapper}>
                  <div className={styles.statsColumn}>
                    <div className={styles.largeScore}>
                      <span
                        className={`label ${styles.largeScoreLabel} ${styles.highlightLabel}`}
                      >
                        <span>WPM</span>
                        <span
                          className={"toolTipIcon"}
                          data-tip
                          data-for='trueWpmTip'
                        >
                          ?
                        </span>
                      </span>
                      <ReactTooltip
                        className={"toolTipWrapper"}
                        id='trueWpmTip'
                        place={"right"}
                        effect={"solid"}
                        backgroundColor={theme.values.tooltipColour}
                        textColor={theme.values.main}
                      >
                        <p>
                          This is your{" "}
                          <span className={styles.highlightLabel}>
                            <b>average words per minute</b>
                          </span>
                          , but lowered for every{" "}
                          <span className={styles.miss}>
                            <b>error</b>
                          </span>{" "}
                          left uncorrected.
                        </p>
                        <p>
                          <code>
                            [correct - (errors - corrected)] / test time
                          </code>
                        </p>
                      </ReactTooltip>
                      <span
                        className={`${styles.largeScoreNumber} ${styles.highlightLabel} ${styles.number}`}
                      >
                        {calculateTrueWPM(
                          stats.correct,
                          stats.incorrect,
                          stats.corrected,
                          0,
                          timeTotal
                        )}
                      </span>
                    </div>

                    <div className={styles.smallScore}>
                      <span className={`label ${styles.smallScoreLabel}`}>
                        <span>Raw WPM</span>
                        <span
                          className={"toolTipIcon"}
                          data-tip
                          data-for='rawWpmTip'
                        >
                          ?
                        </span>
                      </span>
                      <ReactTooltip
                        className={"toolTipWrapper"}
                        id='rawWpmTip'
                        place={"right"}
                        effect={"solid"}
                        backgroundColor={theme.values.tooltipColour}
                        textColor={theme.values.main}
                      >
                        <p>
                          This is your <b>raw average words per minute</b>,
                          calculated using both <b>correct</b> and{" "}
                          <span className={styles.miss}>
                            <b>error</b>
                          </span>{" "}
                          keystrokes.
                        </p>
                        <p>
                          <code>(correct + errors) / test time</code>
                        </p>
                        <p>
                          In brackets is the same, but calculated using only{" "}
                          <b>correct</b> keystrokes.
                        </p>
                        <p>
                          <code>correct/ test time</code>
                        </p>
                      </ReactTooltip>
                      <span>
                        <span
                          className={`${styles.smallScoreNumber} ${styles.number}`}
                        >
                          {calculateRawWPM(
                            stats.correct + stats.incorrect,
                            0,
                            timeTotal
                          )}
                        </span>
                        <span
                          className={`${styles.smallScoreNumber} ${styles.number} ${styles.gray}`}
                        >
                          {` (${calculateRawWPM(stats.correct, 0, timeTotal)})`}
                        </span>
                      </span>
                    </div>
                    <div className={styles.smallScore}>
                      <span
                        className={`label ${styles.smallScoreLabel} ${styles.highlightLabel}`}
                      >
                        Accuracy
                      </span>
                      <span
                        className={`${styles.smallScoreNumber} ${styles.highlightLabel} ${styles.number}`}
                      >
                        {(
                          (stats.correct / (stats.correct + stats.incorrect)) *
                            100 || 0
                        ).toLocaleString("en-US", { maximumFractionDigits: 1 })}
                        %
                      </span>
                    </div>
                    <div className={styles.smallScore}>
                      <span className={`label ${styles.smallScoreLabel}`}>
                        Correct
                      </span>
                      <span
                        className={`${styles.smallScoreNumber} ${styles.number}`}
                      >
                        {stats.correct || 0}
                      </span>
                    </div>
                    <div className={styles.smallScore}>
                      <span>
                        <span
                          className={`label ${styles.smallScoreLabel} ${styles.miss}`}
                        >
                          Errors
                        </span>
                        <span
                          className={`label ${styles.smallScoreLabel} ${styles.gray}`}
                        >
                          {` (corrected)`}
                        </span>
                      </span>
                      <span>
                        <span
                          className={`${styles.smallScoreNumber} ${styles.miss} ${styles.number}`}
                        >
                          {stats.incorrect || 0}
                        </span>
                        <span
                          className={`${styles.smallScoreNumber} ${styles.gray} ${styles.number}`}
                        >
                          {` (${stats.corrected || 0})`}
                        </span>
                      </span>
                    </div>
                  </div>
                  <PerformanceChart rawStats={chartStats} />
                </div>
              </div>
            )}

            <Menu
              isFinished={finished}
              isRunning={isRunning}
              isEditing={isEditing}
              time={time}
              timeTotal={timeTotal}
              onChangeTimeTotal={setTimeTotal}
              onUpdateEditingState={setIsEditing}
              newTest={newTest}
              seed={seed}
            ></Menu>
            {/* DEBUG */}
            {/* <pre>{JSON.stringify({ chartStats }, null, 4)}</pre> */}
          </div>
        )}
        {isMobile && <div>This webapp is not ready for mobile yet, sorry!</div>}
        <Transition in={!isRunning} timeout={500}>
          {(state) => (
            <div className={`${styles.footer} footer-${state}`}>
              <span className={styles.footerItem}>
                typeline Typing Test &copy;2021
              </span>
              <span className={styles.footerItem}>
                Made with love by{" "}
                <a
                  className={styles.footerLink}
                  href='https://donovanyohan.com/'
                  target='_blank'
                >
                  Donovan Yohan
                </a>
              </span>
              <span className={styles.footerItem}>
                View source code on{" "}
                <a
                  className={styles.footerLink}
                  href='https://github.com/donovan-yohan/typeline'
                  target='_blank'
                >
                  GitHub
                </a>
              </span>
            </div>
          )}
        </Transition>
      </main>
      <style jsx>{`
        .header-exiting,
        .footer-exiting {
          opacity: 0;
        }
        .header-exited,
        .footer-exited {
          display: none;
        }
        .textPage {
          margin-top: 32px;
          position: relative;
          max-height: 30vh;
          overflow: hidden;
          opacity: 0;
          transition: opacity ${FADE_DURATION}ms ease-in-out;
        }
        .textTransition-exiting,
        .textTransition-exited {
          opacity: 0;
        }
        .textTransition-entered {
          opacity: 1;
        }
        .textTransition-removed {
          display: none;
        }
        .themeToggle-exiting {
          opacity: 0;
        }
        .themeToggle-exited {
          display: none;
        }
      `}</style>
    </div>
  );
}
