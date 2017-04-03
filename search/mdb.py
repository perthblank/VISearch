import pymongo
import pprint

class MDB(object):
    def __init__(self):
        self.ip= "127.0.0.1"
        self.port = 27017
        self.cname = "main"
        
        self.client = pymongo.MongoClient(self.ip, self.port)
        self.db = self.client.vis
        self.coll = self.db[self.cname]

        self.startYear = 1990
        self.endYear = 2015
    
    def search(self, word):
        if(word==""):
            return {"content":"no data found"}
        word = word.lower()
        kw = self.coll.find({"Author Keywords":{"$in":[word]}})
        te = self.coll.find({"$text":{"$search":word}})
        
       # print "from keyword: ", kw.count()
       # print "from abstract & title: ", te.count()
        return {"kw":kw.count(), "te":te.count()}

    def searchPerYear(self, word):
        word = word.strip().lower();
        words = word.split(' ');
        te = []
        kw = []
        for year in range(self.startYear, self.endYear+1):
            count = self.coll.find({"Year":year, "$text":{"$search":word}}).count()
            te.append({"year":year, "count":count})
            count = self.coll.find({"Year":year, "Author Keywords":{"$all":words}}).count()
            kw.append({"year":year, "count":count})
            
        return {"text":te, "keyword":kw}

    def searchRiver(self, words, qtype):
        words = words.lower()
        wordlist = [w.strip() for w in words.split(",")]
        res = []
        for year in range(self.startYear, self.endYear+1):
            ent = {"year":year}
            for word in wordlist:
                words = word.split(' ')
                if(int(qtype)==1):
                    count = self.coll.find({"Year":year, "Author Keywords":{"$all":words}}).count()
                else:
                    count = self.coll.find({"Year":year, "$text":{"$search":word}}).count()

                ent[word] = count 
                
            res.append(ent)
            
        return {"data":res, "keys":wordlist, "qtype":qtype} 

    def searchList(self, key, year, fields,  qtype):
    	res = []
        found = 0

        print fields
        fields = fields.split(",")

        if(int(qtype)==1):
            found =  self.coll.find({"Year":int(year), "Author Keywords":{"$all":[key]} })
        else:
            found =  self.coll.find({"Year":int(year), "$text":{"$search":key} })

        for ent in found:
            v = {};
            for f in fields:
                v[f] = ent[f]
            res.append(v)
            
        return res

    def searchHeat(self, key, qtype):
        res = {}
        found = 0
        words = key.split(",");
        confs = {}
        for year in range(self.startYear, self.endYear+1):
            if(int(qtype)==1):
                found = self.coll.find({"Year":year, "Author Keywords":{"$all":words}})
            else:
                found = self.coll.find({"Year":year, "$text":{"$search":key}})
            res[year] = {};

            for ent in found:
                if(not isinstance(ent["Conference"], basestring)):
                    continue;
                res[year][ent["Conference"]] = res[year].get(ent["Conference"], 0)+ent["CiteCount"];
                confs[ent["Conference"]] = 1;


        res_arr = []

        for year, val in res.items():
            for conf, count in val.items():
                res_arr.append({"year":year, "conf":conf, "citeCount":count})

        return {"data":res_arr};
        #return {"confs":confs, "data":res_arr};

    #return res

