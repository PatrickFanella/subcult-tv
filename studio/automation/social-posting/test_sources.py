import base64
from datetime import datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.parse

import sources
import radar
from test_runner import CFG


class SourceTests(unittest.TestCase):
    def artifact(self, value):
        return {'uri':'data:text/markdown;charset=utf-8,'+urllib.parse.quote(value, safe=''),
                'sha256':hashlib.sha256(value.encode()).hexdigest()}

    def test_inline_artifact_decoding_and_hash_binding(self):
        value='A + sign, 100% and \nUnicode: é'
        artifact=self.artifact(value)
        self.assertEqual(sources.artifact_bytes(artifact),value.encode())
        artifact['uri']='data:text/markdown;base64,'+base64.b64encode(value.encode()).decode()
        self.assertEqual(sources.artifact_bytes(artifact),value.encode())
        artifact['sha256']='0'*64
        with self.assertRaises(ValueError):sources.artifact_bytes(artifact)

    def test_read_token_is_required_even_when_admin_exists(self):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'.env';path.write_text('API_PORT=28080\nSWITCHYARD_CONTROL_API_TOKEN=admin\n')
            with self.assertRaises(ValueError):sources.control_settings(path)
            path.write_text(path.read_text()+'SWITCHYARD_CONTROL_READ_TOKEN="read"\n')
            self.assertEqual(sources.control_settings(path),('http://127.0.0.1:28080','read'))

    def test_redirects_are_not_followed(self):
        self.assertIsNone(sources.NoRedirect().redirect_request(None,None,302,'',{},'https://other.example/'))

    def test_capture_rejects_private_urls_and_credentials(self):
        self.assertTrue(sources.public_url('https://example.com/article'))
        for url in ['https://10.0.0.1/','https://[::1]/','https://127.0.0.2/',
                    'https://name:secret@example.com/','https://thing.internal/','https://example.com:3000/']:
            with self.subTest(url=url):self.assertFalse(sources.public_url(url))

    def test_expired_inbox_is_ignored_and_quote_requires_original(self):
        now=datetime(2026,10,1,tzinfo=timezone.utc)
        with tempfile.TemporaryDirectory() as folder, patch('sources.get_json',return_value=[]):
            path=Path(folder)/'inbox.json';cfg={'inbox':str(path),'keywords':[]}
            entry={'url':'https://x.com/example/status/123','title':'Post','kind':'quote',
                   'observed_at':(now-timedelta(hours=49)).isoformat()}
            path.write_text(json.dumps([entry]));self.assertEqual(sources.discovery_inputs(cfg,now)['items'],[])
            entry['observed_at']=now.isoformat();path.write_text(json.dumps([entry]))
            self.assertEqual(sources.discovery_inputs(cfg,now)['items'][0]['kind'],'quote')
            entry['url']='https://x.com/example';path.write_text(json.dumps([entry]))
            with self.assertRaises(ValueError):sources.discovery_inputs(cfg,now)

    def test_changemaker_evidence_binding(self):
        now=datetime.now(timezone.utc);draft=self.artifact('Grounded draft [S1]')
        evidence=self.artifact(json.dumps({'items':[{'id':'S1'}]}));evidence['id']='artifact-1'
        version={'version':1,'run_id':'r1','sources_run_id':'r1','ready':True,'draft_generated':True,
                 'draft':draft,'draft_sha256':draft['sha256'],'evidence_sha256':evidence['sha256'],
                 'evidence_artifact_id':'artifact-1','grounding_status':'complete','state':'approved'}
        responses=[{'runs':[{'id':'r1','workflow_id':'changemaker-daily-digest','status':'succeeded','created_at':now.isoformat()}]},
                   {'thread_id':'r1','current_version':1,'versions':[version]}, {'artifacts':[evidence]}]
        with patch('sources.control_settings',return_value=('http://127.0.0.1:28080','read')),patch('sources.get_json',side_effect=responses):
            result=sources.changemaker_context({'env_file':'unused'},now)
            self.assertEqual(result['status'],'available')
            self.assertFalse(result['drafts'][0]['social_approval'])
        version['evidence_sha256']='0'*64
        with patch('sources.control_settings',return_value=('http://127.0.0.1:28080','read')),patch('sources.get_json',side_effect=responses):
            with self.assertRaises(ValueError):sources.changemaker_context({'env_file':'unused'},now)

    def timely(self):
        return {'drafts':[{'account':'patrick','kind':'quote','text':'An observation https://x.com/example/status/123',
            'quote_url':'https://x.com/example/status/123','source_ids':['INBOX-1'],
            'due_at':'2026-10-01T09:00:00-05:00','expires_at':'2026-10-01T13:00:00-05:00'}]}

    def test_timely_requires_captured_source_and_unexpired_window(self):
        now=datetime(2026,10,1,12,tzinfo=timezone.utc)
        context={'items':[{'id':'INBOX-1','kind':'quote','url':'https://x.com/example/status/123'}]}
        radar.validate(self.timely(),context,CFG,now)
        for changes in [{'source_ids':['invented']},{'quote_url':'https://x.com/other/status/99'},
                        {'expires_at':'2026-10-01T06:00:00-05:00'},{'text':'Private: https://git.subcult.tv/private'}]:
            result=self.timely();result['drafts'][0].update(changes)
            with self.subTest(changes=changes),self.assertRaises(ValueError):radar.validate(result,context,CFG,now)

    def test_same_source_cannot_be_blasted_to_multiple_accounts(self):
        result=self.timely();result['drafts'] *= 2
        context={'items':[{'id':'INBOX-1','kind':'quote','url':'https://x.com/example/status/123'}]}
        with self.assertRaises(ValueError):radar.validate(result,context,CFG,datetime(2026,10,1,12,tzinfo=timezone.utc))

    def test_prior_prepared_slots_reserve_daily_capacity(self):
        context={'items':[{'id':'INBOX-1','kind':'quote','url':'https://x.com/example/status/123'}],
                 'prepared_slots':[{'account':'patrick','due_at':'2026-10-01T09:11:00-05:00'}]}
        with self.assertRaisesRegex(ValueError,'spacing'):
            radar.validate(self.timely(),context,CFG,datetime(2026,10,1,12,tzinfo=timezone.utc))

    def test_recollecting_same_activity_does_not_make_a_new_candidate(self):
        now=datetime.now(timezone.utc)
        item={'id':'S1','url':'https://git.subcult.tv/owner/repo/issues/1',
              'updated_at':now.isoformat(),'title':'A current product change'}
        def digest(sha):
            return {'status':'available','drafts':[{'run_id':'r1','evidence_sha256':sha,'evidence':{'items':[item]}}]}
        with patch('radar.discovery_inputs',side_effect=[{'items':[],'warnings':[]},{'items':[],'warnings':[]}]),\
             patch('radar.changemaker_context',side_effect=[digest('a'*64),digest('b'*64)]):
            first=radar.candidates(CFG,now);second=radar.candidates(CFG,now)
            self.assertEqual(first['items'][0]['id'],second['items'][0]['id'])
