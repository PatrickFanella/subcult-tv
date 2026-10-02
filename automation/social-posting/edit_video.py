#!/usr/bin/env python3
"""Make a captioned, silent short edit while preserving the original capture."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile


def edit(source, output, *, start, duration, caption):
    source, output = Path(source).resolve(), Path(output).resolve()
    if source == output or output.exists() or output.with_suffix('.recipe.json').exists():
        raise ValueError('Use a new output path; originals and existing edits are preserved')
    if start < 0 or not 1 <= duration <= 60:
        raise ValueError('Choose a nonnegative start and a duration of 1 to 60 seconds')
    if not caption.strip() or len(caption) > 160 or '\n' in caption:
        raise ValueError('Provide one concise caption, up to 160 characters')
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='social-edit-') as directory:
        text = Path(directory)/'caption.txt'
        text.write_text(caption)
        filters = ('scale=1280:720:force_original_aspect_ratio=decrease,'
                   'pad=1280:800:(ow-iw)/2:0:color=0x18181b,setsar=1,'
                   f'drawtext=textfile={text}:expansion=none:fontcolor=white:fontsize=26:'
                   'x=(w-text_w)/2:y=754')
        command = ['ffmpeg','-hide_banner','-loglevel','error','-n','-ss',str(start),'-i',str(source),
                   '-t',str(duration),'-an','-vf',filters,'-r','30','-c:v','libx264','-crf','22',
                   '-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart',str(output)]
        subprocess.run(command,check=True,timeout=180)
    recipe = {'source':str(source),'source_sha256':hashlib.file_digest(source.open('rb'),'sha256').hexdigest(),
              'start_seconds':start,'requested_duration_seconds':duration,'caption':caption,
              'audio':'removed','format':'1280x800 H.264 MP4, 30 fps',
              'output_sha256':hashlib.file_digest(output.open('rb'),'sha256').hexdigest(),
              'publishing_enabled':False}
    output.with_suffix('.recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
    return recipe


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source',type=Path)
    parser.add_argument('output',type=Path)
    parser.add_argument('--start',type=float,default=0)
    parser.add_argument('--duration',type=float,default=15)
    parser.add_argument('--caption',required=True)
    args = parser.parse_args()
    print(json.dumps(edit(args.source,args.output,start=args.start,duration=args.duration,caption=args.caption),indent=2))
