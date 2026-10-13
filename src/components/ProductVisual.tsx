import type { ShowcaseProduct } from '@/lib/showcase';
import { BRAND_HEROES } from '@/lib/product-visuals';

// Screenshot descriptions for products whose capture shows more than the interface name conveys.
const SCREENSHOT_ALT: Record<string, string> = {
  tadooer: 'Tadooer Today view with sample tasks',
  'chatty-cat':
    'Chatty Cat showing one channel log with timestamped messages, an offline Twitch player and the emote panel, with channel, workspace and privacy controls across the top',
  arkhiv:
    'Arkhiv home page with collection, media and search filters, an item count, and a grid of print items with Read buttons',
  backline:
    'Backline landing page on purple with the headline Keep your people together and an illustrated workflow card for welcome, moderation and support tickets',
  'omarchy-monitor-bar':
    'Omarchy Multi-Monitor Bar settings window listing three monitors, one primary on Full and two on Minimal, with Full, Minimal and Hidden buttons',
  'omarchy-plugin-shelfish':
    'Shelfish settings panel under the Omarchy top bar with a Utilities group, group icons, and lists of available plugins and selected group members',
  'omarchy-superproductivity':
    'Super Productivity panel for Omarchy showing a task in overtime with estimate and spent timers, Stop and Complete buttons, a Quick Add field and a Today list (sample data)',
  'omarchy-plugin-spool':
    'Two Spool previews: the Spool menu with Wave, Jump, size, eyes, wander and monitor options above a purple cassette character, and the same character beside a Thinking bubble',
  'obsidian-plugin-metronome-tuner':
    'Metronome + Tuner view in Obsidian with the Metronome tab selected, a 240 BPM readout with four beat indicators, a Start button and tempo controls',
  'tmux-popups':
    'A tmux session with Neovim open and the tmux-popups Quick Menu in the centre listing popups such as help, shell, tasks, notes, calendar and lazygit with their key bindings',
};

export default function ProductVisual({
  product,
  priority = false,
}: {
  product: ShowcaseProduct;
  priority?: boolean;
}) {
  const { project } = product;
  if (project.slug === 'subsets') {
    return (
      <img
        src="/brand/subsets/product/hero.svg"
        alt="Actual Subsets terminal interface rendered with sample skills, with the creative-writing group selected."
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="showcase-screenshot"
      />
    );
  }
  if (project.slug === 'left-field') {
    return (
      <img
        src="/brand/left-field/hero.svg"
        alt="Left Field: Where the field bends. LF mark on warm paper."
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="showcase-screenshot"
      />
    );
  }
  const hero = BRAND_HEROES.get(project.slug);
  if (hero) {
    return (
      <img
        src={`/brand/${project.slug}/hero.svg`}
        alt={hero}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="showcase-screenshot"
      />
    );
  }
  if (project.screenshot) {
    return (
      <img
        src={project.screenshot}
        alt={SCREENSHOT_ALT[project.slug] ?? `${project.name} interface`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="showcase-screenshot"
      />
    );
  }

  // These editorial illustrations describe use cases, not product interfaces.
  return (
    <div className={`product-illustration illustration-${project.slug}`} aria-hidden="true">
      <span className="illustration-caption">{product.category}</span>
      {project.slug === 'hasanara' || project.slug === 'transcript-create' ? (
        <div className="archive-illustration">
          {project.slug === 'transcript-create' && (
            <div className="rekolekt-lockup">
              <img src="/brand/rekolekt-mark.svg" alt="" />
              <div>
                <strong>rekolekt</strong>
                <span>BY SUBCULT</span>
              </div>
            </div>
          )}
          <div className="archive-wave">
            {Array.from({ length: 32 }, (_, i) => (
              <i key={i} style={{ height: `${(16 + ((i * 13) % 48)) / 16}em` }} />
            ))}
          </div>
          <p className="archive-line">
            <span>00:12:08</span> The line before it.
          </p>
          <p className="archive-line archive-highlight">
            <span>00:12:14</span> The sentence someone was looking for.
          </p>
          <p className="archive-line">
            <span>00:12:21</span> The line after it.
          </p>
          <div className="archive-foot">
            RECORDING → TRANSCRIPT → {project.slug === 'hasanara' ? 'PASSAGE' : 'ARCHIVE'}
          </div>
        </div>
      ) : project.slug === 'subcult-os' ? (
        <div className="event-illustration">
          <div className="event-ticket">
            <span>SUBCULT OS / ADMIT ONE</span>
            <strong>
              DOORS
              <br />
              19:00
            </strong>
            <div className="ticket-bars" />
          </div>
          <div className="event-stages">
            <span>01 / PLAN</span>
            <span>02 / DOORS</span>
            <span>03 / CLOSE-OUT</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
