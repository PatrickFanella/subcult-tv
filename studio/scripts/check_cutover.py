"""Read-only verification of the Kvant source cutover."""
import json
from pathlib import Path

repo = Path(__file__).resolve().parents[1]
receipts = json.loads((repo / 'docs/cutover-receipt.json').read_text())
for item in receipts:
    old = Path(item['old_path'])
    assert old.is_symlink(), old
    # The original receipt is historical provenance; resolve its source suffix
    # against this checkout to verify the new consumer destination.
    suffix = Path(item['authoritative_path']).relative_to('/home/onnwee/Work/Subcult/subcult-studio')
    assert old.resolve() == (repo / suffix).resolve(), old
    assert Path(item['recovery_copy']).is_dir(), item['recovery_copy']
for unit in (repo / 'automation/social-posting').glob('social-posting-*'):
    if unit.suffix in {'.service', '.timer'}:
        installed = Path.home() / '.config/systemd/user' / unit.name
        assert installed.is_symlink() and installed.resolve() == unit.resolve(), installed
cfg = json.loads((repo / 'automation/social-posting/config.json').read_text())
assert cfg['bluesky']['publishing_enabled'] is False
assert cfg['content_root'] == '.'
assert (repo / cfg['media_library']).is_dir()
assert (repo / cfg['editorial_guide']).is_file()
print(f'Cutover verified: {len(receipts)} compatibility paths; unit links and config valid.')
