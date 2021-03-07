import getDocumentCoords from "../utils/getDocumentCoords.js";

export default function scrollToMiddle(elem) {
  let posY = getDocumentCoords(elem).top;
  let y = posY - window.innerHeight / 2;

  window.scrollTo({
    top: y,
    left: 0,
    behavior: "smooth",
  });
}
