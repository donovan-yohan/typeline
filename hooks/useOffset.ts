import { useState, useEffect, MutableRefObject, RefObject } from "react";

export interface OffsetType {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export const useOffset = <T extends HTMLElement, U extends HTMLElement>(
  parentRef: MutableRefObject<T> | RefObject<T>,
  childRef: MutableRefObject<U> | RefObject<U> | null,
  properties: any[] = []
) => {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [right, setRight] = useState(0);
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    const parent = parentRef?.current;
    const child = childRef?.current;

    if (parent && window.getComputedStyle(parent).position === "static") {
      throw new Error(
        "parent must have a position other than static! https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent"
      );
    }

    let current: HTMLElement | null | undefined = child;
    let xAcc = 0;
    let yAcc = 0;
    while (current && !current.isEqualNode(parent)) {
      xAcc += current.offsetLeft;
      yAcc += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }

    if (current && child) {
      setLeft(xAcc);
      setTop(yAcc);
      setRight(xAcc + child.offsetWidth);
      setBottom(yAcc + child.offsetHeight);
    } else {
      console.warn("Could not find parent from child.");
    }
  }, [
    childRef,
    childRef?.current?.offsetHeight,
    childRef?.current?.offsetWidth,
    ...properties
  ]);

  return { left, top, right, bottom } as OffsetType;
};
