import glob, re

dic = {}
for f in glob.glob("*.ctx"):
    with open(f, 'r') as b:
        l = b.readlines()
        if len(l)  > 17 :
                dic[f] = l[17:]

for f, nl in dic.iteritems():
    F = open(f, "w")
    F.writelines(nl)
    F.close()

                                    
        
