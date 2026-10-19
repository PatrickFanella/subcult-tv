// Captions under the landing-page figure where "<name> interface" would mislead.
export const SCREENSHOT_CAPTIONS: Record<string, string> = {
  'omarchy-superproductivity': 'Super Productivity for Omarchy / panel with sample data',
  'omarchy-plugin-spool': 'Spool / desktop previews',
  'tmux-popups': 'tmux-popups / frame from the demo recording',
  'chatty-cat': 'Chatty Cat / live test build at chat.subcult.tv',
  headcount: 'Headcount / engagement map at headcount.subcult.tv',
  arkhiv: 'Arkhiv / Anarchist Zine Archive at arkhiv.subcult.tv',
  backline: 'Backline / landing page at backline.subcult.tv',
};

// Products without a screenshot that show their Studio brand hero instead.
export const BRAND_HEROES = new Map<string, string>([
  ['left-field', 'Left Field: Where the field bends. LF mark on warm paper.'],
  ['overlaid', 'Overlaid brand mark: a tally lamp on an overlay card, with the name beside it'],
  [
    'pirs',
    'Pirs brand mark: a pier over three pilings with one hook point, with the name beside it',
  ],
  [
    'super-productivity-mcp',
    'super-productivity-mcp brand mark: a bridge arc between two posts, with the name beside it',
  ],
]);
