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
    cached = cfg.get('_campaign_context')
    if cached and cached.get('source_sha256') == hashlib.sha256(raw).hexdigest():
        return cached
    data = json.loads(raw)
    if data.get('version') != 1 or not isinstance(data.get('projects'), dict):
        raise ValueError('Invalid marketing strategy pack')
    import packets
    import campaign_review
    selected_packets = packets.load(path.parent, refresh=cfg.get('refresh_packets', True))
    for key, project in data['projects'].items():
        project['packet'] = selected_packets.get(key, {'status': 'missing', 'flags': ['No selected campaign packet.']})
    learning = campaign_review.report(Path(cfg.get('state', '/nonexistent')), data['projects'], cfg.get('channels'))
    result = {**data, 'source_sha256': hashlib.sha256(raw).hexdigest(), 'campaign_review': learning}
    cfg['_campaign_context'] = result
    return result


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
    reviews = pack.get('campaign_review', {}).get('projects', {}).get(product, {}).get('themes', [])
    failed = {t['pillar_id'] for t in reviews if t['decision'] == 'fix_journey_before_distribution'}
    eligible = [p for p in selected['pillars'] if p['id'] not in failed]
    if not eligible:
        raise ValueError('Campaign journeys need repair before another showcase')
    pillar = min(eligible, key=lambda p: counts[p['id']])
    return {'product': product, 'strategy_sha256': pack['source_sha256'],
            'pillar_id': pillar['id'], 'pillar': pillar, 'strategy': selected,
            'review_metadata': metadata(cfg, product, pillar['id'])}


def metadata(cfg, product, pillar_id='', theme=''):
    pack = context(cfg)
    p = pack.get('projects', {}).get(product)
    if not p:
        return {'status': 'unassigned', 'project': '', 'theme': theme or 'Editorial post',
                'flags': ['No project packet selected; review this editorial post separately.']}
    packet = p.get('packet', {})
    pillar = next((x for x in p['pillars'] if x['id'] == pillar_id), None)
    flags = list(packet.get('flags', []))
    if not packet:
        flags.append('No selected campaign packet.')
    learning = pack.get('campaign_review', {}).get('projects', {}).get(product, {})
    theme_review = next((t for t in learning.get('themes', []) if t['pillar_id'] == pillar_id), {})
    if theme_review.get('decision') == 'fix_journey_before_distribution':
        flags.append('Recorded demonstration failed; fix the reader journey before distribution.')
    elif not theme_review.get('asset_ids'):
        flags.append('No inspected demonstration recorded for this theme; do not claim a demonstrated result.')
    if not pillar:
        flags.append('Theme is outside the selected campaign; review the angle before approval.')
    return {'status': packet.get('status', 'missing'), 'project': product, 'project_name': p.get('name', product),
            'packet_revision': packet.get('revision', ''), 'packet_sha256': packet.get('sha256', ''),
            'pillar_id': pillar_id if pillar else '', 'theme': pillar.get('story', pillar['id']) if pillar else theme,
            'reader_action': p.get('cta', {}).get('action', ''), 'destination': p.get('cta', {}).get('url', ''),
            'measurement': p.get('measurement', ''), 'flags': flags,
            'review_decision': theme_review.get('decision', 'select_campaign_theme'),
            'asset_ids': theme_review.get('asset_ids', []), 'result_ids': theme_review.get('result_ids', []),
            'asset_task': p.get('first_use_check', '')}


def attach(cfg, draft, product='', pillar_id='', theme='', reader_action=None):
    record = metadata(cfg, product, pillar_id, theme)
    if isinstance(reader_action, str):
        record['reader_action'] = reader_action[:600]
    draft.setdefault('craft', {})['campaign'] = record
