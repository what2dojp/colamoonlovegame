const PORTRAIT_DIR = new URL("../../assets/portraits/", import.meta.url);
const PORTRAIT_REV = "20260816";

export const CHARACTER_PORTRAITS = {
  nini: new URL(`nini.png?v=${PORTRAIT_REV}`, PORTRAIT_DIR).href,
  meteor: new URL(`meteor.png?v=${PORTRAIT_REV}`, PORTRAIT_DIR).href,
  pepsi: new URL(`pepsi.png?v=${PORTRAIT_REV}`, PORTRAIT_DIR).href,
  jupiter: new URL(`jupiter.png?v=${PORTRAIT_REV}`, PORTRAIT_DIR).href,
  mars: new URL(`mars.png?v=${PORTRAIT_REV}`, PORTRAIT_DIR).href,
};

/** nini / pepsi uploads are landscape; the others are tall cutouts. */
export const CHARACTER_PORTRAIT_LAYOUT = {
  nini: "wide",
  meteor: "tall",
  pepsi: "wide",
  jupiter: "tall",
  mars: "tall",
};

export function characterPortraitSrc(id) {
  return CHARACTER_PORTRAITS[id] || "";
}

export function characterPortraitLayout(id) {
  return CHARACTER_PORTRAIT_LAYOUT[id] || "tall";
}
