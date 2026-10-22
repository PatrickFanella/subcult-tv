import hashlib
import json
from pathlib import Path
import tempfile
import unittest
import campaign_metrics
import campaign_review


class MetricsTests(unittest.TestCase):
    def test_metrics_preserve_zero_but_never_missing_and_drop_private_fields(self):
        post = {'id':'provider1','status':'sent','channelId':'channel1','sentAt':'2026-01-01T00:00:00Z',
                'text':'A specific task','metricsUpdatedAt':'2026-01-02T00:00:00Z', 'private':'secret',
                'metrics':[{'type':'impressions','value':0},{'type':'clicks','value':None},{'type':'reactions','value':2}]}
        rows = campaign_metrics.extract({'content':[{'text':json.dumps({'edges':[{'node':post}]})}]})
        self.assertEqual(rows[0]['metrics'], {'impressions':0,'reactions':2})
        self.assertNotIn('secret', json.dumps(rows))
        self.assertNotIn('A specific task', json.dumps(rows))
        self.assertEqual(campaign_metrics.extract({**post,'metricsUpdatedAt':None}), [])
        with tempfile.TemporaryDirectory() as tmp:
            state=Path(tmp);campaign_metrics.save(state,post);campaign_metrics.save(state,post)
            self.assertEqual(len(json.loads((state/'provider-metrics.json').read_text())),1)
            run=state/'runs'/'one';run.mkdir(parents=True)
            (run/'result.json').write_text(json.dumps({'drafts':[{'account':'subcult','text':post['text'],
                'craft':{'campaign':{'project':'one','pillar_id':'one-1'}}}]}))
            projects={'one':{'pillars':[{'id':'one-1','story':'A task'}]}}
            report=campaign_review.report(state,projects,{'subcult':'channel1'})
            self.assertEqual(len(report['projects']['one']['themes'][0]['provider_observations']),1)
            self.assertEqual(report['projects']['one']['themes'][0]['decision'],'capture_demonstration')
            wrong=campaign_review.report(state,projects,{'patrick':'channel1'})
            self.assertEqual(len(wrong['unattributed_provider_observations']),1)
