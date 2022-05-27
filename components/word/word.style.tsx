import styled from "@emotion/styled";
import { LetterSpanProps } from "./word.definition";

export const LetterSpan = styled.span<LetterSpanProps>`
  position: relative;
  font-size: 32px;
  color: ${(props) => props.color};

  &:after {
    display: ${(props) => !props.showWrongLetter && "none"};
    content: "${(props) => props.actual}";
    color: red;
    position: absolute;
    width: 100%;
    text-align: center;
    top: 80%;
    left: 0;
    font-size: 0.66em;
  }
`;

export const WordWrapper = styled.div`
  white-space: nowrap;
  margin-right: 0.5em;
`;
