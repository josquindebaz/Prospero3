import re 
with open("grappes.txt", "r") as gs:
    gn = 0
    dicg = {}
    for l in re.split('\n', gs.read()):
        if re.search("^$", l):
            break
        if re.search("^\d$", l):
            gn = l
        else:
            dicg[re.sub("\s$", "", l)] = gn


#with open("grappes.net", "r") as n:
with open("entites.net", "r") as n:
    lines = re.split('\n', n.read())
    clubuf = ""
    c = 0
    for l in lines:
        if re.search("\*Arcs", l):
            break
        if re.search("^\d", l):
            c += 1
            nl, el = re.split(' "', l)
            nl = int(nl)
            el = el[:-1]
            if el in dicg.keys():
                print el, dicg[el]
                clubuf += "\n%s" % dicg[el]
            else:
                clubuf += "\n0" 
    clubuf = "*Vertices %d%s" % (c, clubuf)

#with open("grappesT.clu", 'w') as gw:
with open("entites.clu", 'w') as gw:
    gw.write(clubuf)
