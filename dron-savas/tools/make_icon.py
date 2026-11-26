# Uygulama ikonu: 24x24 piksel dron, en yakın komşu ile ölçeklenir
from PIL import Image
import os, sys
P = {'.':None,'k':(12,14,20),'g':(74,80,97),'l':(154,161,176),'w':(238,241,245),'r':(196,58,51),'o':(240,141,53),'y':(247,201,72),'b':(47,90,168)}
A = [
"........................",
"..kkkk............kkkk..",
".kllllk..........kllllk.",
".kllllk..........kllllk.",
"..kkgk............kgkk..",
"....kgk..........kgk....",
".....kgk........kgk.....",
"......kgkkkkkkkkgk......",
".......kggggggggk.......",
".......kgwwbbwwgk.......",
".......kgwbyybwgk.......",
".......kgwbyybwgk.......",
".......kgwwbbwwgk.......",
".......kggggggggk.......",
"......kgkkkrrkkkgk......",
".....kgk..krrk..kgk.....",
"....kgk...koork..kgk....",
"..kkgk.....kk.....kgkk..",
".kllllk..........kllllk.",
".kllllk..........kllllk.",
"..kkkk............kkkk..",
"...........o............",
"..........ooo...........",
"...........y............"]
im = Image.new('RGBA',(24,24),(16,20,28,255))
for y,row in enumerate(A):
    for x,c in enumerate(row):
        if P[c]: im.putpixel((x,y),P[c]+(255,))
out = sys.argv[1]
for name,s in [('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)]:
    d=os.path.join(out,'mipmap-'+name); os.makedirs(d,exist_ok=True)
    im.resize((s,s),Image.NEAREST).save(os.path.join(d,'ic_launcher.png'))
