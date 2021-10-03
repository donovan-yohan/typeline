import getDocumentCoords from "../utils/getDocumentCoords.js";

export default function getMiddleCoord(elem) {
  let posY = getDocumentCoords(elem).top;
  let y = posY - window.innerHeight / 2;
  return y;
}
