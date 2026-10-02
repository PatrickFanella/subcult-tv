from pathlib import Path
import json,subprocess,os
r=Path(__file__).resolve().parent
for b in json.loads((r/'brands.json').read_text()):
 if os.environ.get('BRAND_ONLY') and b['slug']!=os.environ['BRAND_ONLY']:continue
 v=r/'brands'/b['slug']/'video'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-loop','1','-framerate','30','-t','4','-i',str(v/'title-card.png'),'-loop','1','-framerate','30','-t','4','-i',str(v/'end-card.png'),'-filter_complex','[0:v]fade=t=in:st=0:d=0.2,fade=t=out:st=3.8:d=0.2[v0];[1:v]fade=t=in:st=0:d=0.2,fade=t=out:st=3.8:d=0.2[v1];[v0][v1]concat=n=2:v=1:a=0,format=yuv420p[v]','-map','[v]','-an','-c:v','libx264','-preset','veryfast','-crf','24','-threads','2','-movflags','+faststart',str(v/'template-preview.mp4')],check=True)
 print(b['brand'])
