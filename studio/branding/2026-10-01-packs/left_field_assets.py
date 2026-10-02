"""Left Field's editorial identity; vector masters for the shared pack builder."""
import design_helpers as H

T, rect, line = H.txt, H.rect, H.line


def mark(d, x, y, size):
    # Both letters meet the same baseline; their 26×26 overlap is the accent.
    ink, accent = d['fg'], d['accent']
    body = f'<path d="M18 18h26v100h50v26H18z M68 18h74v26H94v24h40v26H94v50H68z" fill="{ink}"/>'
    body += rect(68,118,26,26,accent)
    return f'<g transform="translate({x} {y}) scale({size/160})">{body}</g>'


def ledger(d, x, y, w, h):
    """Abstract source rows, deliberately without invented rankings or statistics."""
    s = rect(x,y,w,h,d['secondary'])
    for i, text in enumerate(['SEAT RECORD', 'SOURCE NOTES', 'METHOD / CONTEXT']):
        yy=y+38+i*(h-52)/3
        s += T(x+22,yy,text,16,d['fg'],d['label'],maxw=w-50)
        s += line(x+22,yy+16,x+w-22,yy+16,d['fg'],1)
    return s + rect(x,y,7,h,d['accent'])


def banner(d):
    s=rect(0,0,1200,400,d['bg'])
    # Keep the bottom-left avatar overlap free of critical copy.
    s+=T(42,57,'LEFT FIELD',27,d['fg'],d['body'],700)
    s+=T(1150,57,'BY SUBCULT',14,d['accent'],d['label']).replace('x="1150"','text-anchor="end" x="1150"')
    s+=line(42,80,1158,80,d['fg'],3)
    s+=T(250,174,'Read the field.',72,d['fg'],d['display'],700,maxw=700)
    s+=T(250,256,'Trace the evidence.',72,d['fg'],d['display'],700,maxw=700)
    s+=T(250,335,'SEAT RESEARCH / SOURCE CONTEXT',16,d['accent'],d['label'])
    s+=mark(d,993,135,155)
    return s


def post(d):
    s=rect(0,0,600,600,d['bg'])
    s+=T(36,49,'LEFT FIELD / BY SUBCULT',15,d['accent'],d['label'])+line(36,72,564,72,d['fg'],3)
    s+=T(36,155,'Read the field.',57,d['fg'],d['display'],700,maxw=528)
    s+=T(36,223,'Trace the evidence.',57,d['fg'],d['display'],700,maxw=528)
    s+=ledger(d,36,285,358,206)+mark(d,428,322,135)
    s+=line(36,527,564,527,d['fg'],2)+T(36,568,'SEAT RESEARCH / SOURCE CONTEXT',15,d['fg'],d['label'])
    return s
