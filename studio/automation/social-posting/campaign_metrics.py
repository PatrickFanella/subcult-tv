"""Keep bounded, dated provider observations; never infer adoption from engagement."""
import hashlib
import json
import math


def extract(payload):
    found = []
    def walk(value):
        if isinstance(value, str):
            try: walk(json.loads(value))
            except (ValueError, RecursionError): pass
        elif isinstance(value, list):
            for item in value: walk(item)
        elif isinstance(value, dict):
            if value.get('status') == 'sent' and value.get('metricsUpdatedAt') and isinstance(value.get('metrics'), list):
                metrics = {}
                for m in value['metrics']:
                    if not isinstance(m, dict): continue
                    n = m.get('value')
                    if m.get('type') in ('reactions','comments','reposts','impressions','clicks','engagementRate') and isinstance(n, (int,float)) and not isinstance(n,bool) and math.isfinite(n) and n >= 0:
                        metrics[m['type']] = n
                if metrics:
                    found.append({'provider_id':value['id'], 'channel_id':value.get('channelId',''),
                                  'sent_at':value.get('sentAt',''), 'metrics_updated_at':value['metricsUpdatedAt'],
                                  'text_sha256':hashlib.sha256(value.get('text','').encode()).hexdigest(), 'metrics':metrics})
            for key, item in value.items():
                if key != 'metrics': walk(item)
    walk(payload)
    return list({(r['provider_id'],r['metrics_updated_at']):r for r in found}.values())


def save(state, payload):
    from campaign_review import read
    from runner import atomic_write
    rows = read(state/'provider-metrics.json', [])+extract(payload)
    unique = {(r['provider_id'],r['metrics_updated_at']):r for r in rows}
    rows = sorted(unique.values(), key=lambda r:r['metrics_updated_at'], reverse=True)[:1000]
    atomic_write(state/'provider-metrics.json', json.dumps(rows, indent=2)+'\n')
    return len(rows)


def from_events(state, events):
    results = [e['item']['result'] for e in events if e.get('type') == 'item.completed'
               and e.get('item',{}).get('type') == 'mcp_tool_call'
               and e['item'].get('server') == 'buffer' and e['item'].get('tool') == 'list_posts'
               and e['item'].get('status') == 'completed' and not e['item'].get('error')
               and not e['item'].get('result',{}).get('isError')]
    return save(state, results)
