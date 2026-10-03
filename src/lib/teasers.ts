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
      'After the collapse, the radio stays on all night. Log every call and initial it. Lately the calls keep leading back to the people who took you in.',
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
    summary:
      'One voice, late at night, recorded close and dry. It starts ordinary. It doesn’t stay there.',
    art: { kind: 'audio' },
  },
];
