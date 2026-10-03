#!/usr/bin/env python3
"""Generate a candidate without modifying live routing or authentication."""
import sys,json,re,hashlib
from pathlib import Path
root=Path(__file__).resolve().parent
source=Path(sys.argv[1]);out=Path(sys.argv[2]);text=source.read_text();before=hashlib.sha256(source.read_bytes()).hexdigest()
for host,entry in json.loads((root/'routes.json').read_text()).items():
 pattern=re.compile(r'^http://'+re.escape(host)+r' \{\n.*?^\}',re.M|re.S)
 match=pattern.search(text)
 if not match:raise SystemExit('Missing site '+host)
 b=match.group();upstream=entry['upstream'].removeprefix('http://')
 lines=b.splitlines();result=[];i=0;count=0
 while i<len(lines):
  line=lines[i]
  if re.match(r'\s*reverse_proxy '+re.escape(upstream)+r'(?:\s*\{|\s*$)',line):
   segment=[line];depth=line.count('{')-line.count('}')
   while depth:
    i+=1;segment.append(lines[i]);depth+=lines[i].count('{')-lines[i].count('}')
   indent=re.match(r'\s*',line).group();result.append(indent+'route {')
   for matcher in ['@subcultAssets','@subcultHTML']:
    if matcher=='@subcultHTML':
     result.append(indent+'\treverse_proxy '+matcher+' subcult-branding:8080 '+upstream+' {')
     result.extend(indent+'\t\t'+x for x in ['lb_policy first','lb_try_duration 1s','lb_try_interval 100ms','fail_duration 10s','max_fails 1','unhealthy_status 502 503 504'])
     if len(segment)>1:result.extend('\t'+s for s in segment[1:-1])
     result.append(indent+'\t}')
    else:
     result.append(indent+'\treverse_proxy '+matcher+' subcult-branding:8080'+(' {' if len(segment)>1 else ''))
     if len(segment)>1:result.extend('\t'+s for s in segment[1:])
   result.extend('\t'+s for s in segment);result.append(indent+'}');count+=1
  else:result.append(line)
  i+=1
 if not count:raise SystemExit('Missing upstream '+host)
 result[1:1]=['\t# SUBCULT Studio: web pages and local brand assets only.', '\t@subcultHTML header Accept *text/html*', '\t@subcultAssets path /_subcult/*']
 if host=='uptime.subcult.tv':result[4:4]=['\thandle /_subcult/* {','\t\treverse_proxy subcult-branding:8080','\t}']
 text=text[:match.start()]+'\n'.join(result)+text[match.end():]
 print(host,count,'page routes; API/auth upstream retained')
out.write_text(text)
Path(str(out)+'.source-sha256').write_text(before+'\n')
