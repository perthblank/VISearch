# coding: utf-8

print "prepare..."

import pandas as pd
import re
import pymongo
from vconfig import *

#get data from excel file
xl = pd.ExcelFile(dataFile)
df0 = xl.parse("Main dataset")
criteria = ["Year","Paper Title", "Abstract", 
            "Author Keywords", "Author Names", "References", "Conference", "Link", "Paper DOI"]
tosplit = ["Author Keywords"]
df = df0.loc[:,criteria]

#get the cited times of each paper
refcount = {}
for i, row in df.iterrows():
    if(not isinstance(row["References"], basestring)):
        continue
    refs =  row["References"].split(";")
    for r in refs:
        refcount[r] = refcount.get(r, 0)+1;
        

#define mdb class
class MDB(object):
    def __init__(self):
        self.ip= dbIP
        self.port = dbPort
        self.cname = dbCollection
        
        self.client = pymongo.MongoClient(self.ip, self.port)
        self.db = self.client.vis
        self.coll = self.db[self.cname]
    
    def insert(self, df):
        for i, data in df.iterrows():
            ent = {}
            for c in criteria:
                if(isinstance(data[c], basestring)):
                    ent[c] = data[c].lower()
                else:
                    ent[c] = data[c]
            for s in tosplit:
                if(isinstance(ent[s], basestring)):
                    ent[s] = [x.strip() for x in re.split('[,\s]', ent[s])]
                else:
                    ent[s] = ""
                    
            ent["CiteCount"] = refcount.get(data["Paper DOI"], 0)
                    
            self.coll.insert_one(ent)
            
    def createTextIndex(self):
        self.coll.create_index([("Abstract", pymongo.TEXT), ("Paper Title", pymongo.TEXT)])
        """
        db.main.createIndex({Abstract:"text","Paper Title":"text"})
        """
        


mdb = MDB()

print "insert data..."
mdb.insert(df)


print "create index..."
mdb.createTextIndex();

print "test..."
mdb.coll.find_one({"Year":1995, "$text":{"$search":"geographic"}})

print "ok"
