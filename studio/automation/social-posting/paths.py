from pathlib import Path

def root(cfg):
    if 'content_root' in cfg:
        value=Path(cfg['content_root'])
        return value if value.is_absolute() else Path(__file__).resolve().parents[2]/value
    return Path(cfg['vault'])

def social(cfg):
    return root(cfg)/cfg.get('social_folder','001 Projects/Works/Social Posts')
