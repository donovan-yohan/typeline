import App from "next/app";
import React from "react";
import Context from "../components/context";
import "../styles/globals.css";
import { cssRootVars, cssDarkVars } from "../styles/globalVars.js";
export default class MyApp extends App {
  state = {
    theme: "light",
    values: cssRootVars,
  };

  componentDidMount = () => {
    const storedTheme = localStorage.getItem("theme");

    // Define which query we will check
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    // If matches, set data-theme to dark
    if (storedTheme === "light") {
      // do nothing
    } else if (mediaQuery.matches || storedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      this.setState({ theme: "dark", values: cssDarkVars });
    }
  };

  toggleTheme = () => {
    let newTheme = this.state.theme;
    newTheme === "dark" ? (newTheme = "light") : (newTheme = "dark");
    let newValues = newTheme === "dark" ? cssDarkVars : cssRootVars;

    localStorage.setItem("theme", newTheme);

    let transition = document.createElement("div");
    transition.setAttribute("id", "transition");
    let color =
      newTheme === "dark" ? cssDarkVars.background : cssRootVars.background;
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
      document
        .getElementById("transition")
        .parentNode.removeChild(document.getElementById("transition"));
    }, 750);
  };

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Context.Provider
        value={{
          theme: this.state.theme,
          values: this.state.values,
          toggleTheme: this.toggleTheme,
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
              this.state.theme == "light"
                ? cssRootVars.background
                : cssDarkVars.background,
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
            html[data-theme="dark"] {
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
