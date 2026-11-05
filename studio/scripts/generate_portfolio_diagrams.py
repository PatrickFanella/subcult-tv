#!/usr/bin/env python3
"""Render selected implementation diagrams and a captured terminal frame.

The diagrams describe source-reviewed responsibilities, not application screens.
Subsets text is an actual Ink render from its pinned source and sample skills.
Public selection, outlined exports and hashes live in docs/portfolio-visual-provenance.json.
"""

import html
import json
from pathlib import Path

STUDIO = Path(__file__).resolve().parents[1]
OUTPUT = STUDIO / 'media/files/portfolio-2026-11-05'
CAPTURE = STUDIO / 'media/sources/portfolio-2026-11-05/subsets-tui.json'

DIAGRAMS = {
    'rekolekt': {
        'title': 'Recordings to cited moments',
        'nodes': [
            ('Recordings', ['Source media', 'and metadata']),
            ('Rekolekt', ['Transcribe and index', 'Headless archive API']),
            ('Passage search', ['Text and timestamps', 'linked to the source']),
            ('HasanAra', ['Independent frontend', 'Search, read, replay']),
        ],
        'note': 'HasanAra owns its interface. Rekolekt supplies the archive backend.',
        'limit': 'SELF-HOSTED SOFTWARE / AUTOMATIC TRANSCRIPTS NEED CHECKING',
    },
    'super-productivity-mcp': {
        'title': 'Connect an assistant to your task app',
        'nodes': [
            ('Assistant', ['An MCP client', 'on your computer']),
            ('MCP server', ['Task and project', 'commands and results']),
            ('Plugin bridge', ['Local file messages', 'Companion plugin']),
            ('Task app', ['Super Productivity', 'Your tasks and plans']),
        ],
        'note': 'Run the local server and enable the companion plugin to connect the two.',
        'limit': 'LOCAL INTEGRATION / BOTH SERVER AND PLUGIN ARE REQUIRED',
    },
    'pirs': {
        'title': 'A separate experimental host',
        'nodes': [
            ('PDS', ['Sequencer events', 'from the server']),
            ('Private bridge', ['Retained event delivery', 'Opt-in local socket']),
            ('Wasmtime host', ['Bounded components', 'Manifest permissions']),
        ],
        'note': 'Standalone host and event-delivery research; production integration remains open.',
        'limit': 'EXPERIMENTAL / NO SUPPORTED PRODUCTION PDS PLUGIN SYSTEM',
    },
}


def escape(value):
    return html.escape(str(value), quote=True)


def text(x, y, value, size, color, family='sans-serif', weight='400'):
    return (f'<text xml:space="preserve" x="{x}" y="{y}" fill="{color}" font-family="{escape(family)}" '
            f'font-size="{size}" font-weight="{weight}">{escape(value)}</text>')


def token_value(value):
    return value['value'] if isinstance(value, dict) else value


def font_value(value):
    return value['family'] if isinstance(value, dict) else value


def diagram(slug, content):
    tokens = json.loads((STUDIO / 'brands' / slug / 'tokens.json').read_text())
    colors = {key: token_value(value) for key, value in tokens['colors'].items()}
    bg, fg = colors['bg'], colors.get('fg', colors.get('text'))
    accent, muted = colors['accent'], colors['secondary']
    display, body, label = [font_value(tokens['fonts'][role]) for role in ('display', 'body', 'label')]
    title = f'{tokens["brand"]}: {content["title"]}'
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900" role="img" aria-labelledby="title desc">',
             f'<title id="title">{escape(title)}</title>',
             f'<desc id="desc">{escape(content["note"])} {escape(content["limit"])}</desc>',
             f'<rect width="1440" height="900" fill="{bg}"/>',
             f'<path d="M80 112H1360M80 704H1360" stroke="{muted}" stroke-width="2"/>',
             text(80, 84, tokens['brand'], 30, accent, display, '700'),
             text(80, 188, 'IMPLEMENTATION DIAGRAM / NOVEMBER 2026', 21, muted, label),
             text(80, 260, content['title'], 52, fg, display, '700')]
    nodes = content['nodes']
    gap = 48
    width = (1280 - gap * (len(nodes) - 1)) / len(nodes)
    for index, (heading, lines) in enumerate(nodes):
        x = 80 + index * (width + gap)
        parts.append(f'<rect x="{x}" y="360" width="{width}" height="244" fill="none" stroke="{accent}" stroke-width="2"/>')
        parts.append(text(x + 22, 400, f'{index + 1:02}', 21, muted, label))
        parts.append(text(x + 22, 450, heading, 29, fg, display, '700'))
        parts.extend(text(x + 22, 502 + n * 34, line, 21, fg, body) for n, line in enumerate(lines))
        if index < len(nodes) - 1:
            start, end = x + width + 8, x + width + gap - 8
            parts.append(f'<path d="M{start} 482H{end}m-10 -8 10 8 -10 8" fill="none" stroke="{accent}" stroke-width="3"/>')
    parts.extend([text(80, 678, content['note'], 24, fg, body),
                  text(80, 766, content['limit'], 20, accent, label),
                  text(80, 834, 'SUBCULT / WORKFLOW DIAGRAM / NOT AN APPLICATION SCREEN', 17, muted, label), '</svg>'])
    return '\n'.join(parts) + '\n'


def terminal(capture):
    lines = capture['frames']['skills'].rstrip('\n').splitlines()
    if capture['columns'] != 80 or max(map(len, lines)) > 80:
        raise ValueError('Expected the actual 80-column Ink capture')
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">',
             '<title>Subsets: actual terminal render with sample skills</title>',
             '<rect width="1440" height="900" fill="#d9dedc"/>',
             '<rect x="64" y="152" width="1312" height="590" fill="#17201e" stroke="#64716c" stroke-width="2"/>',
             text(64, 88, 'subsets / terminal', 38, '#17201e', 'Space Grotesk', '700')]
    parts.extend(text(88, 204 + index * 29, line, 23, '#e3efe9', 'JetBrains Mono') for index, line in enumerate(lines))
    parts.extend([text(64, 808, 'ACTUAL INK RENDER / SIX SYNTHETIC SAMPLE SKILLS', 23, '#17201e', 'JetBrains Mono'),
                  text(64, 854, f'Source {capture["sourceCommit"][:12]} / {capture["version"]}', 20, '#17201e', 'JetBrains Mono'), '</svg>'])
    return '\n'.join(parts) + '\n'


def tmux_help():
    source = (CAPTURE.parent / 'tmux-help.txt').read_text()
    excerpt = source[source.index('Direct binds'):source.index('\nR       reload tmux')].rstrip()
    lines = excerpt.splitlines()
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="900" viewBox="0 0 1440 900">',
             '<title>tmux-popups: current generated help excerpt</title>',
             '<rect width="1440" height="900" fill="#101418"/>',
             text(64, 88, 'tmux-popups / generated help', 38, '#e6edf3', 'JetBrains Mono', '700'),
             '<path d="M64 128H1376M64 752H1376" stroke="#7faec7" stroke-width="2"/>']
    parts.extend(text(64, 188 + index * 23, line, 18, '#d5e3eb', 'JetBrains Mono') for index, line in enumerate(lines))
    parts.extend([text(64, 808, 'ACTUAL CLI OUTPUT EXCERPT / DISPOSABLE SMALL-PROFILE ENVIRONMENT', 20, '#7faec7', 'JetBrains Mono'),
                  text(64, 854, 'Source fef6aa1f4510 / generated from the current registry', 20, '#d5e3eb', 'JetBrains Mono'), '</svg>'])
    return '\n'.join(parts) + '\n'


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for slug, content in DIAGRAMS.items():
        (OUTPUT / f'{slug}-flow.svg').write_text(diagram(slug, content))
    (OUTPUT / 'subsets-terminal.svg').write_text(terminal(json.loads(CAPTURE.read_text())))
    (OUTPUT / 'tmux-help.svg').write_text(tmux_help())
    print('Generated three implementation diagrams and two actual terminal renders.')


if __name__ == '__main__':
    main()
