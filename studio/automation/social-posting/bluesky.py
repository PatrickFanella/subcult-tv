"""Prepare Bluesky variants locally. This module has no publishing or login path."""
import json
import re
from pathlib import Path
import media


def prepare(result, cfg):
    accounts = cfg.get('bluesky', {}).get('accounts', {})
    assets = {a['id']:a for a in media.context(cfg)['assets']}
    proposals = []
    for draft in result['drafts']:
        destination = accounts.get(draft['account'])
        if not destination:
            continue
        text = draft['text']
        # Existing <=280 code-point drafts are conservatively below 300 graphemes.
        # The lexicon separately limits UTF-8 bytes to 3000.
        if len(text) > 300 or len(text.encode('utf-8')) > 3000:
            raise ValueError('Bluesky text exceeds conservative limits')
        checks = [draft.get('next_check',''), 'Approve exact copy, account, media and time before delivery.']
        if re.search(r'(?<!\w)@[A-Za-z0-9_]+', text):
            checks.append('Resolve or replace X mentions with verified Bluesky identities; no mention facets inferred.')
        if re.search(r'https://(?:www\.)?(?:x\.com|twitter\.com)/', text):
            checks.append('X post is an external link, not a native Bluesky quote. Review platform relevance.')
        choice = draft.get('media', {'mode':'none','asset_ids':[],'brief':'','alt_text':''})
        selected = []
        for aid in choice.get('asset_ids', []):
            a = assets.get(aid)
            if not a or 'bluesky' not in a['platforms'] or a['bytes'] >= 1_000_000:
                a = next((variant for variant in assets.values()
                          if variant.get('parent_id') == aid and 'bluesky' in variant['platforms']
                          and draft['account'] in variant['accounts'] and variant['bytes'] < 1_000_000), a)
            if not a or 'bluesky' not in a['platforms'] or draft['account'] not in a['accounts']:
                checks.append('Prepare Bluesky-eligible media for '+aid)
                continue
            if a['kind'] != 'video' and a['bytes'] >= 1_000_000:
                checks.append('Prepare an image derivative below 1 MB for '+aid)
                continue
            selected.append({'id':a['id'], 'source_asset_id':aid, 'file':a['file'], 'alt_text':a.get('alt_text','')})
        proposals.append({'platform':'bluesky','account':draft['account'],'handle':destination['handle'],
            'expected_did':destination.get('did'), 'connection_state':destination['state'],
            'due_at':draft['due_at'], 'text':text, 'media':choice, 'eligible_assets':selected,
            'checks':[c for c in checks if c], 'state':'unapproved','publishing_enabled':False})
    return proposals


def save(directory, result, cfg):
    proposals = prepare(result, cfg)
    media.atomic(Path(directory)/'bluesky-drafts.json',json.dumps(proposals,indent=2,ensure_ascii=False)+'\n')
    return proposals
