const PORTRAIT_DIR = new URL("../../assets/portraits/", import.meta.url);

export const CHARACTER_PORTRAITS = {
  nini: new URL("nini.png", PORTRAIT_DIR).href,
  meteor: new URL("meteor.png", PORTRAIT_DIR).href,
  pepsi: new URL("pepsi.png", PORTRAIT_DIR).href,
  jupiter: new URL("jupiter.png", PORTRAIT_DIR).href,
  mars: new URL("mars.png", PORTRAIT_DIR).href,
};

export const CHARACTER_PORTRAIT_FALLBACKS = {
  nini: new URL("nini.svg", PORTRAIT_DIR).href,
  meteor: new URL("meteor.svg", PORTRAIT_DIR).href,
  pepsi: new URL("pepsi.svg", PORTRAIT_DIR).href,
  jupiter: new URL("jupiter.svg", PORTRAIT_DIR).href,
  mars: new URL("mars.svg", PORTRAIT_DIR).href,
};

export function characterPortraitSrc(id) {
  return CHARACTER_PORTRAITS[id] || "";
}

export function characterPortraitFallback(id) {
  return CHARACTER_PORTRAIT_FALLBACKS[id] || "";
}
