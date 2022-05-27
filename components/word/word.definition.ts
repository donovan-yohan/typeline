import React from "react";

export interface WordProps {
  expected: string;
  actual: string;
  id: string;
  passed: boolean;
  current: boolean;
  parentRef: React.RefObject<HTMLDivElement>;
}

export interface LetterProps {
  expected: string;
  actual: string;
  active: boolean;
  wordPassed: boolean;
  wordPerfect?: boolean;
}

export interface LetterSpanProps {
  color: string;
  actual: string;
  expected: string;
  showWrongLetter: boolean;
}
