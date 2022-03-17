import App from "next/app";
import React from "react";
import Context from "../components/context";
import "../styles/globals.scss";
import { cssRootVars, cssDarkVars } from "../styles/globalVars.js";

enum THEMES {
  LIGHT = "light",
  DARK = "dark"
}

export interface ThemeProps {
  background: string;
  main: string;
  mainFaded: string;
  highlight: string;
  highlightFaded: string;
  incorrect: string;
  gray: string;
  fade: string;
  grayOpacity: string;
  tooltipColour: string;
  tooltipColourFade: string;
  themeFilter: string;
  hoverFilter: string;
}

interface State {
  theme: THEMES;
  values: ThemeProps;
}

export default class MyApp extends App {
  state: State = {
    theme: THEMES.LIGHT,
    values: cssRootVars
  };

  componentDidMount = () => {
    const storedTheme = localStorage.getItem("theme");

    // Define which query we will check
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    // If matches, set data-theme to dark
    if (storedTheme === THEMES.LIGHT) {
      // do nothing
    } else if (mediaQuery.matches || storedTheme === THEMES.DARK) {
      document.documentElement.setAttribute("data-theme", THEMES.DARK);
      this.setState({ theme: THEMES.DARK, values: cssDarkVars });
    }
  };

  toggleTheme = () => {
    let newTheme = this.state.theme;
    newTheme === THEMES.DARK
      ? (newTheme = THEMES.LIGHT)
      : (newTheme = THEMES.DARK);
    let newValues = newTheme === THEMES.DARK ? cssDarkVars : cssRootVars;

    localStorage.setItem("theme", newTheme);

    let transition = document.createElement("div");
    transition.setAttribute("id", "transition");
    let color =
      newTheme === THEMES.DARK
        ? cssDarkVars.background
        : cssRootVars.background;
    transition.style.backgroundColor = color;

    document.getElementsByTagName("body")[0].appendChild(transition);

    window.setTimeout(function () {
      document.documentElement.setAttribute("data-theme", newTheme);
    }, 320);
    window.setTimeout(
      function () {
        this.setState({ theme: newTheme, values: newValues });
      }.bind(this),
      320
    );

    window.setTimeout(function () {
      let t = document.getElementById("transition");
      if (t) {
        t.parentNode?.removeChild(t);
      }
    }, 750);
  };

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Context.Provider
        value={{
          theme: this.state.theme,
          values: this.state.values,
          toggleTheme: this.toggleTheme
        }}
      >
        <div
          className='fouc'
          style={{
            zIndex: 9999999999,
            position: "fixed",
            width: "100%",
            height: "100%",
            top: "0",
            left: "0",
            backgroundColor:
              this.state.theme == THEMES.LIGHT
                ? cssRootVars.background
                : cssDarkVars.background
          }}
        />
        <Component {...pageProps} />
        <style jsx global>
          {`
            .fouc {
              display: none;
            }

            #transition {
              position: fixed;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              z-index: 99999;
              animation: fade 0.75s ease-in-out;
            }
            @keyframes fade {
              0% {
                opacity: 0;
              }
              35% {
                opacity: 1;
              }
              65% {
                opacity: 1;
              }
              100% {
                opacity: 0;
              }
            }

            html {
              ${Object.entries(cssRootVars)
                .map(([key, val]) => `--${key}: ${val}`)
                .join(";")}
            }
            html[data-theme=${THEMES.DARK}] {
              ${Object.entries(cssDarkVars)
                .map(([key, val]) => `--${key}: ${val}`)
                .join(";")}
            }
          `}
        </style>
      </Context.Provider>
    );
  }
}
