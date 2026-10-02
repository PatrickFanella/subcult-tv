from pathlib import Path
import argparse,html,json,re,shutil
p=argparse.ArgumentParser(description="Create an editable starter brand pack from brand.json.")
p.add_argument("config",type=Path);p.add_argument("output",type=Path);a=p.parse_args()
b=json.loads(a.config.read_text());c=b["colors"];f=b["fonts"]
for key in ["background","text","accent","secondary"]:
 if not re.fullmatch(r"#[0-9a-fA-F]{6}",c[key]):raise SystemExit("Invalid hex color: "+key)
if a.output.exists():raise SystemExit("Output already exists; choose a new directory.")
a.output.mkdir(parents=True)
for name,(w,h) in {"banner":(1500,500),"square-post":(1080,1080),"story":(1080,1920),"landscape-post":(1600,900),"avatar":(512,512)}.items():
 size=min(w*.10,h*.18);x=w*.08;y=h*.30
 s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+str(w)+' '+str(h)+'"><title>'+html.escape(b['name']+' '+name)+'</title><rect width="100%" height="100%" fill="'+c['background']+'"/><path d="M'+str(x)+' '+str(h*.13)+'H'+str(w-x)+'" stroke="'+c['accent']+'" stroke-width="4"/><text x="'+str(x)+'" y="'+str(y)+'" font-family="'+html.escape(f['display'],quote=True)+'" font-size="'+str(size)+'" font-weight="700" fill="'+c['text']+'">'+html.escape(b['name'])+'</text><text x="'+str(x)+'" y="'+str(h*.48)+'" font-family="'+html.escape(f['body'],quote=True)+'" font-size="'+str(size*.36)+'" fill="'+c['text']+'">'+html.escape(b['tagline'])+'</text><text x="'+str(x)+'" y="'+str(h*.84)+'" font-family="'+html.escape(f['label'],quote=True)+'" font-size="'+str(size*.26)+'" fill="'+c['secondary']+'">'+html.escape(b['website'])+'</text></svg>'
 (a.output/(name+'.svg')).write_text(s)
shutil.copy2(a.config,a.output/'brand.json')
(a.output/'asset-manifest.json').write_text(json.dumps({'status':'draft','brand':b['name'],'formats':['banner','square-post','story','landscape-post','avatar'],'source':'brand.json','mark_status':b['mark'],'alt_text':'Describe the completed artwork and its visible text before publishing.'},indent=2))
print(a.output)
