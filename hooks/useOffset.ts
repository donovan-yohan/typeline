import { MutableRefObject, RefObject, useCallback, useEffect, useState } from "react";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";

export interface OffsetType {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export const EmptyOffsetType = {
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0
};

export const useOffset = <T extends HTMLElement, U extends HTMLElement>(
  parentRef: MutableRefObject<T> | RefObject<T>,
  childRef: MutableRefObject<U> | RefObject<U> | null,
  properties: any[] = []
) => {
  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);
  const [right, setRight] = useState(0);
  const [bottom, setBottom] = useState(0);

  const handleOffset = useCallback((parent: HTMLElement, child: HTMLElement) => {
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
  }, []);

  useIsomorphicLayoutEffect(() => {
    const parent = parentRef?.current as HTMLElement;
    const child = childRef?.current as HTMLElement;
    console.log("running");

    if (parent && window.getComputedStyle(parent).position === "static") {
      throw new Error(
        "parent must have a position other than static! https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent"
      );
    }

    handleOffset(parent, child);
  }, [
    childRef,
    childRef?.current?.offsetHeight,
    childRef?.current?.offsetWidth,
    ...properties
  ]);

  return { left, top, right, bottom } as OffsetType;
};
