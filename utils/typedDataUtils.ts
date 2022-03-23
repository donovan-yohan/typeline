declare global {
  interface String {
    splice(start: number, deleteCount: number, add?: string): string;
  }
}

Object.defineProperty(String.prototype, "splice", {
  value: function (start: number, end: number, add = "") {
    return this.slice(0, start) + add + this.slice(end, this.length);
  },
  configurable: true
});

// TODO: ignore these when typing to cursor
export const BACKSPACE_CHAR = "←";
export const SPACE_CHAR = "↗";
export const PREVWORD_CHAR = "↙";
