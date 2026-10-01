/**
 * Unannounced work shown as teasers. These projects are deliberately
 * unnamed: no title, page, repository link, or catalog entry until the
 * owner announces them.
 */
export interface Teaser {
  id: string;
  label: string;
  medium: string;
  summary: string;
  art: { kind: 'image'; src: string; alt: string } | { kind: 'audio' };
}

export const TEASERS: Teaser[] = [
  {
    id: 'untitled-game',
    label: 'Untitled game',
    medium: 'Game / first-person mystery',
    summary:
      'A radio outpost after the collapse. Strange calls come in at night, and each one leads back to the people who took you in.',
    art: {
      kind: 'image',
      src: '/teasers/game-radio-desk.webp',
      alt: 'A desk lamp lights an old radio set in a dark room. A note on the wall reads “Log every call. Initial it.”',
    },
  },
  {
    id: 'untitled-audio',
    label: 'Untitled audio show',
    medium: 'Audio / monologue',
    summary: 'A late-night monologue, recorded close and dry, that drifts somewhere uncanny.',
    art: { kind: 'audio' },
  },
];
