import React from "react";

export interface WordProps {
  expected: string;
  actual: string;
  id: string;
}

export interface LetterProps {
  expected: string;
  actual: string;
  active: boolean;
}

export interface LetterSpanProps {
  color: string;
  actual: string;
  showWrongLetter: boolean;
}
