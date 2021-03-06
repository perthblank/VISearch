import pymongo
import pprint
import stopWords
import re
from nltk.stem.wordnet import WordNetLemmatizer

from index.views import OptionConfig 

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

        self.oc = OptionConfig()

    def __getCondition(self, qtype, year, content):
        #content = ' '.join(map(lambda x: "\""+x+"\"", content.split(' ')))
        #print(content);
        if(qtype==self.oc.keywords_te):
            contents = content.split(' ')
            cond = {"Author Keywords":{"$all":contents}}
        elif(qtype==self.oc.mix_te):
            content = ' '.join(map(lambda x:"\""+x+"\"", content.split(' ')))
            cond = {"$text":{"$search":content}}
        else:
            cond = {"$text":{"$search":'\"' + content + '\"'}}
        if(year != "*"):
            cond["Year"] = year
        return cond

    def groupbyMulti(self, content, qtype, criterion, oc):
        content = content.lower()
	# contentlist = [content]
	# if(qtype != oc.author_te):
	#     contentlist = [w.strip() for w in content.split(";")]
        contentlist = [w.strip() for w in content.split(";")]
        res = []

        for year in range(self.startYear, self.endYear+1):
            for c in contentlist:
                ent = {"year":year}
                condition = self.__getCondition(qtype, year, c)
                found = self.coll.find(condition)

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

    def groupbyConf(self, content, qtype, criterion, oc):
        res = {}
        confs = {}
        for year in range(self.startYear, self.endYear+1):
            condition = self.__getCondition(qtype, year, content)
            found = self.coll.find(condition)
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

    def findEntries(self, meta):
        qtype = meta["qtype"]
        query = meta["query"]

        if "year" in query:
            year = query["year"]
        else:
            year = "*"
        key = query["key"]

        condition = self.__getCondition(qtype, year, key);

        if "conference" in query:
            condition["Conference"] = query["conference"]

        found = self.coll.find(condition)
        return found
       
    def searchList(self, meta):
        found = self.findEntries(meta);
        fields = meta["fields"].split(",")
    	res = []
        for ent in found:
            v = {};
            for f in fields:
                v[f] = ent[f]
            res.append(v)
            
        return res

    def searchCloud(self, meta):
        found = self.findEntries(meta)
        res = dict()

        for ent in found:
            self.countWord(ent[meta['count']], res)
        return res

    def countWord(self, text, dd):
        if type(text) is float:
            return
	if type(text) is unicode:
          for word in re.split('[\W\s]', text):
              if word in stopWords.stopWordsSet:
                  continue;
              norm = WordNetLemmatizer().lemmatize(word)
              if(norm == word): #maybe verb
                  norm2 = WordNetLemmatizer().lemmatize(word,"v")
                  if norm2!=norm:
                      continue;
              dd[norm] = dd.get(norm,0)+1
	elif type(text) is list:
	  for word in text:
              dd[word] = dd.get(word,0)+1

    def searchAuthor(self, s):
        res = [];
        for year in range(self.startYear, self.endYear+1):
            cond = {"Year": year, "$text":{"$search":'\"' + s + '\"'}}
            count = self.coll.find(cond).count()
            #res.append({"year": year, s: count})
            res.append({"count":count, "key": s, "year": year})
        return {"data": res, "keys": [s]};

    def searchAuthorStr(self, s):
        pass
