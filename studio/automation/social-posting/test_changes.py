import hashlib
import json
import subprocess
import unittest
import urllib.error
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import changes

CFG = {'changes': {'repositories': ['org/undertow', 'org/kork'], 'max_items': 2, 'max_excerpt_chars': 20,
                   'page_size': 2, 'max_pages': 3, 'username': 'subcult-agent'}}
NOW = datetime(2026, 10, 11, 9, 20, tzinfo=timezone.utc)


def pull(number, merged_at, title='feat: a thing', body='## Why\n\nPeople wanted it.', merged=True, labels=()):
    stamp = merged_at.isoformat()
    return {'number': number, 'title': title, 'body': body, 'merged': merged, 'merged_at': stamp if merged else None,
            'closed_at': stamp, 'created_at': (merged_at-timedelta(hours=2)).isoformat(), 'updated_at': stamp,
            'html_url': f'https://git.example/org/repo/pulls/{number}', 'user': {'login': 'subcult-agent'},
            'labels': [{'name': name} for name in labels]}


class Collection(unittest.TestCase):
    def test_transient_get_failure_retries_without_retrying_authentication(self):
        response = unittest.mock.MagicMock()
        response.__enter__.return_value.read.return_value = b'[]'
        opener = unittest.mock.Mock()
        opener.open.side_effect = [urllib.error.HTTPError('https://git.example', 503, 'busy', {}, None), response]
        with patch.object(changes.urllib.request, 'build_opener', return_value=opener), patch.object(changes.time, 'sleep') as sleep:
            self.assertEqual(changes.get_gitea('https://git.example', 'private'), [])
            self.assertEqual(opener.open.call_count, 2)
            sleep.assert_called_once_with(2)
        opener.open.reset_mock()
        opener.open.side_effect = urllib.error.HTTPError('https://git.example', 401, 'auth', {}, None)
        with patch.object(changes.urllib.request, 'build_opener', return_value=opener), patch.object(changes.time, 'sleep') as sleep:
            with self.assertRaises(urllib.error.HTTPError):
                changes.get_gitea('https://git.example', 'private')
            self.assertEqual(opener.open.call_count, 1)
            sleep.assert_not_called()

    def test_repeated_connection_failures_stop_after_three_reads(self):
        opener = unittest.mock.Mock()
        opener.open.side_effect = urllib.error.URLError('unreachable')
        with patch.object(changes.urllib.request, 'build_opener', return_value=opener), patch.object(changes.time, 'sleep'):
            with self.assertRaises(urllib.error.URLError):
                changes.get_gitea('https://git.example', 'private')
        self.assertEqual(opener.open.call_count, 3)

    def test_api_error_object_is_not_treated_as_an_empty_repository(self):
        with patch.object(changes, 'gitea_token', return_value='secret'), \
             patch.object(changes, 'get_gitea', return_value={'message': 'unavailable'}):
            result = changes.changes_context(CFG, NOW)
        self.assertEqual(result['status'], 'partial')
        self.assertEqual(result['drafts'][0]['evidence']['failed_source_count'], 2)

    def test_keeps_only_pulls_merged_inside_the_window_in_merge_order(self):
        chicago = timezone(timedelta(hours=-5))
        inside_late = pull(22, datetime(2026, 10, 10, 19, 8, 49, tzinfo=chicago), body='x'*40)
        inside_early = pull(21, NOW-timedelta(hours=20))
        closed_unmerged = pull(23, NOW-timedelta(hours=1), merged=False)
        too_old = pull(9, NOW-timedelta(days=3))
        responses = {'org/undertow': [[inside_late, closed_unmerged], [inside_early, too_old]], 'org/kork': [[]]}
        def fake(url, token):
            self.assertEqual(token, 'secret')
            repo = url.split('/repos/')[1].split('/pulls')[0]
            return responses[repo].pop(0)
        with patch.object(changes, 'gitea_token', return_value='secret'), patch.object(changes, 'get_gitea', side_effect=fake):
            evidence = changes.collect_changes(CFG, NOW)
        self.assertEqual([i['id'] for i in evidence['items']], ['S1', 'S2'])
        self.assertEqual([i['number'] for i in evidence['items']], [21, 22])
        late = evidence['items'][1]
        self.assertEqual(late['updated_at'], '2026-10-11T00:08:49Z')  # normalized to UTC like the earlier adapter
        self.assertEqual(late['merged_at'], '2026-10-11T00:08:49Z')
        self.assertEqual(late['excerpt'], 'x'*20+' [truncated]')
        self.assertEqual(late['body_bytes'], 40)
        self.assertEqual(late['body_sha256'], hashlib.sha256(b'x'*40).hexdigest())
        self.assertEqual(late['state'], 'merged'); self.assertEqual(late['kind'], 'pull request')
        self.assertEqual(evidence['status'], 'complete'); self.assertEqual(evidence['failed_source_count'], 0)
        self.assertEqual(evidence['counts'], {'org/undertow': 2, 'org/kork': 0})
        self.assertEqual(responses['org/undertow'], [])  # the second page was read because the first was all recent

    def test_item_cap_records_omissions_and_a_failed_repository_marks_the_collection_partial(self):
        pulls = [pull(n, NOW-timedelta(hours=n)) for n in (1, 2, 3)]
        def fake(url, token):
            if 'org/kork' in url:
                raise OSError('unreachable')
            return pulls if 'page=1' in url else []
        with patch.object(changes, 'gitea_token', return_value='secret'), patch.object(changes, 'get_gitea', side_effect=fake):
            evidence = changes.collect_changes(CFG, NOW)
        self.assertEqual(evidence['item_count'], 2)
        self.assertEqual(evidence['omitted_item_count'], 1)
        self.assertTrue(evidence['omitted_items'][0]['reason'].startswith('exceeds max_items'))
        self.assertEqual(evidence['status'], 'partial')
        self.assertEqual(evidence['failures'], [{'repository': 'org/kork', 'error': 'OSError'}])

    def test_context_is_hash_bound_and_empty_without_merges(self):
        with patch.object(changes, 'gitea_token', return_value='secret'), patch.object(changes, 'get_gitea', return_value=[]):
            self.assertEqual(changes.changes_context(CFG, NOW)['drafts'], [])
        with patch.object(changes, 'gitea_token', return_value='secret'), \
             patch.object(changes, 'get_gitea', side_effect=lambda url, token: [pull(5, NOW-timedelta(hours=1))] if 'page=1' in url and 'undertow' in url else []):
            context = changes.changes_context(CFG, NOW)
        self.assertEqual(context['status'], 'available')
        draft = context['drafts'][0]
        self.assertEqual(draft['run_id'], 'changes-20261011T092000Z')
        self.assertFalse(draft['social_approval'])
        self.assertEqual(draft['draft_sha256'], hashlib.sha256(draft['draft'].encode()).hexdigest())
        canonical = json.dumps(draft['evidence']['items'], sort_keys=True, separators=(',', ':')).encode()
        self.assertEqual(draft['evidence_sha256'], hashlib.sha256(canonical).hexdigest())
        with patch.object(changes, 'gitea_token', return_value='secret'), \
             patch.object(changes, 'get_gitea', side_effect=lambda url, token: [pull(5, NOW-timedelta(hours=1))] if 'page=1' in url and 'undertow' in url else []):
            later = changes.changes_context(CFG, NOW+timedelta(minutes=5))
        self.assertEqual(later['drafts'][0]['evidence_sha256'], draft['evidence_sha256'])  # same merges, same evidence
        self.assertIn('collection note, not a digest', draft['draft'])
        from sources import complete_changemaker_digest
        self.assertIs(complete_changemaker_digest(context), draft)

    def test_credential_comes_from_the_git_helper_and_must_be_the_agent(self):
        filled = subprocess.CompletedProcess([], 0, stdout='protocol=https\nhost=git.example\nusername=subcult-agent\npassword=tok\n')
        with patch.object(changes.subprocess, 'run', return_value=filled) as run:
            self.assertEqual(changes.gitea_token({**changes.DEFAULTS, 'base_url': 'https://git.example', 'username': 'subcult-agent'}), 'tok')
            self.assertEqual(run.call_args.kwargs['input'], 'protocol=https\nhost=git.example\n')
        other = subprocess.CompletedProcess([], 0, stdout='username=someone\npassword=tok\n')
        with patch.object(changes.subprocess, 'run', return_value=other), self.assertRaises(ValueError):
            changes.gitea_token({**changes.DEFAULTS, 'base_url': 'https://git.example', 'username': 'subcult-agent'})

    def test_repositories_default_to_the_products_and_may_not_be_emptied(self):
        self.assertEqual(len(changes.settings({})['repositories']), 6)
        self.assertIn('subculture-collective/rekolekt', changes.settings({'changes': {}})['repositories'])
        with self.assertRaises(ValueError):
            changes.collect_changes({'changes': {'repositories': []}}, NOW)


if __name__ == '__main__':
    unittest.main()
