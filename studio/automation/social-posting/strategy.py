"""Read Studio's campaign direction without treating it as capability evidence."""
import hashlib
import json
from pathlib import Path

STUDIO = Path(__file__).resolve().parents[2]


def context(cfg):
    path = Path(cfg['strategy_file']) if cfg.get('strategy_file') else STUDIO/'content/marketing/strategies.json'
    if not path.exists() and not cfg.get('strategy_file'):
        return {}  # Legacy installations and disposable tests have no strategy pack.
    raw = path.read_bytes()
    data = json.loads(raw)
    if data.get('version') != 1 or not isinstance(data.get('projects'), dict):
        raise ValueError('Invalid marketing strategy pack')
    return {**data, 'source_sha256': hashlib.sha256(raw).hexdigest()}


def campaign(cfg, product, state):
    """Rotate themes within a product, using prepared drafts rather than assumed delivery."""
    pack = context(cfg)
    selected = pack.get('projects', {}).get(product)
    if not selected:
        return {}
    counts = {p['id']: 0 for p in selected['pillars']}
    for path in (Path(state)/'runs').glob('*/result.json'):
        if path.is_symlink() or path.stat().st_size > 2_000_000:
            continue
        try:
            for draft in json.loads(path.read_text()).get('drafts', []):
                pillar = (draft.get('craft') or {}).get('campaign', {}).get('pillar_id')
                if pillar in counts:
                    counts[pillar] += 1
        except (ValueError, OSError, AttributeError):
            continue
    pillar = min(selected['pillars'], key=lambda p: counts[p['id']])
    return {'product': product, 'strategy_sha256': pack['source_sha256'],
            'pillar_id': pillar['id'], 'pillar': pillar, 'strategy': selected}
