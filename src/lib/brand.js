// Official LoneStar CR brand assets — bundled locally in public/ (sourced from
// the brand folder + live-app CDN). BASE_URL keeps paths right on GitHub Pages.
const BASE = import.meta.env.BASE_URL || '/'
export const BRAND = {
  logo: BASE + 'lonestar-logo.png',
  luna: BASE + 'luna.png',
  lunaWordmark: BASE + 'luna-wordmark.png', // "LUNA'S WRITING NOOK" lockup, navy on transparent
  lunaAdventure: BASE + 'luna-adventure-2.png', // "LUNA'S WRITING ADVENTURE" crystal lockup, tagline cropped off (2026-09-24)
  rocket: BASE + 'rocket.png',
  launchBg: BASE + 'launch-bg.jpg',
  trophy: BASE + 'trophy.png',
  classcade: 'https://assets.cleark12.com/clearlearning/classcadelogo.png',
}
