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

    def __byKeywords(self, year, content):
        contents = content.split(' ')
        return {"Year":year, "Author Keywords":{"$all":contents}}

    def __byText(self, year, content):
        return {"Year":year, "$text":{"$search":content}}

    """
    def searchPerYear(self, content):
        content = content.strip().lower();
        contents = content.split(' ');
        te = []
        kw = []
        for year in range(self.startYear, self.endYear+1):
            count = self.coll.find({"Year":year, "$text":{"$search":content}}).count()
            te.append({"year":year, "count":count})
            count = self.coll.find({"Year":year, "Author Keywords":{"$all":contents}}).count()
            kw.append({"year":year, "count":count})
            
        return {"text":te, "keyword":kw}
    """

    #def searchFreq(self, content, qtype, oc):
    def groupbyMulti(self, content, qtype, criterion, oc):
        content = content.lower()
        contentlist = [w.strip() for w in content.split(",")]
        res = []

        for year in range(self.startYear, self.endYear+1):
            for c in contentlist:
                ent = {"year":year}
                if(qtype==oc.keywords_te):
                    found = self.coll.find(self.__byKeywords(year, c))
                else:
                    found = self.coll.find(self.__byText(year, c))

                if(criterion == oc.cited_te):
                    count = 0;
                    for f in found:
                        count += f["CiteCount"]
                else:
                    count = found.count()

                ent["key"] = c 
                ent["count"] = count
                res.append(ent)

        return {"data":res, "keys":contentlist, "qtype":qtype, "search": ""} 


    #def searchCited(self, content, qtype, oc):
    def groupbyConf(self, content, qtype, criterion, oc):
        res = {}
        confs = {}
        for year in range(self.startYear, self.endYear+1):
            if(qtype==oc.keywords_te):
                found = self.coll.find(self.__byKeywords(year, content))
            else:
                found = self.coll.find(self.__byText(year, content))
            res[year] = {};

            for ent in found:
                if(not isinstance(ent["Conference"], basestring)):
                    continue;
                if(criterion == oc.cited_te):
                    res[year][ent["Conference"]] = res[year].get(ent["Conference"], 0)+ent["CiteCount"];
                else:
                    res[year][ent["Conference"]] = res[year].get(ent["Conference"], 0)+1;
                confs[ent["Conference"]] = 1;

        res_arr = []

        for year, val in res.items():
            for conf, count in val.items():
                res_arr.append({"year":year, "key":conf, "count":count})

        return {"data":res_arr, "keys": confs.keys(), "qtype": qtype, "search": content};

    def searchList(self, meta, oc):
        fields = meta["fields"]
        qtype = meta["qtype"]
        data = meta["data"]

    	res = []
        found = 0
        fields = fields.split(",")
        year = data["year"]
        key = data["key"]
        condition = {"Year": int(year)}

        if(qtype==oc.keywords_te):
            condition["Author Keywords"] = {"$all":[key]} 
        else:
            condition["$text"] = {"$search":key}

        if "conference" in data:
            condition["Conference"] = data["conference"]

        found = self.coll.find(condition)

        for ent in found:
            v = {};
            for f in fields:
                v[f] = ent[f]
            res.append(v)
            
        return res

