import styled from "@emotion/styled";
import { LetterSpanProps } from "./word.definition";

export const LetterSpan = styled.span<LetterSpanProps>`
  position: relative;
  font-size: 32px;
  color: ${(props) => props.color};
  opacity: ${(props) => props.opacity};
  text-decoration: ${(props) => (props.underline ? "underline" : "none")};

  &:after {
    display: ${(props) => !props.showWrongLetter && "none"};
    content: "${(props) => props.actual}";
    position: absolute;
    width: 100%;
    text-align: center;
    top: 80%;
    left: 0;
    font-size: 0.66em;
  }
`;

export const WordWrapper = styled.span`
  padding-right: 0.5em;
`;
