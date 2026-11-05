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
    id: 'untitled-audio',
    label: 'Untitled audio show',
    medium: 'Audio / monologue',
    summary:
      'One voice, late at night, recorded close and dry. It starts ordinary. It doesn’t stay there.',
    art: { kind: 'audio' },
  },
];
