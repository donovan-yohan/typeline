export interface WordProps {
  index: number;
  activeIndex: number;
  expected: string;
  actual: string;
  id: string;
}

export interface LetterProps {
  expected: string;
  actual: string;
  active: boolean;
  wordPassed: boolean;
}

export interface LetterSpanProps {
  color: string;
  opacity: number;
  underline: boolean;
  actual: string;
  showWrongLetter: boolean;
}
