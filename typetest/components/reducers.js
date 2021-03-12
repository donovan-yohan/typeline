export let initialCursorState = {
  letterRef: null,
  isFirstChar: true,
};

export function cursorReducer(state, action) {
  switch (action.type) {
    case "setLetterRef":
      return {
        letterRef: action.payload || state.letterRef,
        isFirstChar: action.isFirstChar,
      };

    default:
      throw new Error();
  }
}

export let initialHighlightState = {
  wordRef: null,
};

export function highlightReducer(state, action) {
  switch (action.type) {
    case "setWordRef":
      return {
        wordRef: action.payload || state.wordRef,
      };
    default:
      throw new Error();
  }
}

export let initialStatsState = {
  correct: 0,
  incorrect: 0,
  streak: 0,
  maxStreak: 0,
};

export function statsReducer(state, action) {
  switch (action.type) {
    case "addCorrect":
      return {
        correct: state.correct + 1,
        incorrect: state.incorrect,
        streak: state.streak + 1,
        maxStreak:
          state.streak + 1 > state.maxStreak
            ? state.streak + 1
            : state.maxStreak,
      };
    case "addIncorrect":
      return {
        correct: state.correct,
        incorrect: state.incorrect + 1,
        streak: 0,
        maxStreak: state.maxStreak,
      };
    case "resetStreak":
      return {
        correct: state.correct,
        incorrect: state.incorrect,
        streak: 0,
        maxStreak: state.maxStreak,
      };
    case "reset":
      return {
        correct: 0,
        incorrect: 0,
        streak: 0,
        maxStreak: state.maxStreak,
      };
    case "resetAll":
      return {
        correct: 0,
        incorrect: 0,
        streak: 0,
        maxStreak: 0,
      };
    default:
      throw new Error();
  }
}

export function textTypedReducer(state, action) {
  switch (action.type) {
    case "updateTextTyped":
      return state.map((w, i) => {
        if (i == action.targetIndex) {
          return action.newValue;
        } else {
          return w;
        }
      });
    default:
      throw new Error();
  }
}
