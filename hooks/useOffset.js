import { useState, useEffect } from "react";

export const useOffset = (parentRef, childRef, properties = []) => {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [right, setRight] = useState(0);
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    const parent = parentRef?.current;
    const child = childRef?.current;
    if (window.getComputedStyle(parent).position === "static") {
      throw new Error(
        "parent must have a position other than static! https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent"
      );
    }

    let current = child;
    let xAcc = 0;
    let yAcc = 0;
    while (current && current != parent) {
      xAcc += current.offsetLeft;
      yAcc += current.offsetTop;
      current = current.offsetParent;
    }

    if (current) {
      setLeft(xAcc);
      setTop(yAcc);
      setRight(xAcc + child.offsetWidth);
      setBottom(yAcc + child.offsetHeight);
    } else {
      console.warn("Could not find parent from child.");
    }
  }, [childRef, ...properties]);

  return { left, top, right, bottom };
};
