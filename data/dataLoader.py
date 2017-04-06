
# coding: utf-8

# In[ ]:

import pandas as pd
import numpy as np
import re
import math
import copy
import pymongo
import pprint


# In[ ]:

dataFile = "./data.xlsx"
dbIP = "127.0.0.1"
dbPort = 27017
dbCollection = "main"


# In[ ]:

#get data from excel file
xl = pd.ExcelFile(dataFile)
df0 = xl.parse("Main dataset")
#print xl.sheet_names
#print df0.columns
criteria = ["Year","Paper Title", "Abstract", 
            "Author Keywords", "Author Names", "References", "Conference", "Link", "Paper DOI"]
tosplit = ["Author Keywords"]
df = df0.loc[:,criteria]


# In[ ]:

#get the cited times of each paper
refcount = {}
for i, row in df.iterrows():
    if(not isinstance(row["References"], basestring)):
        continue
    refs =  row["References"].split(";")
    for r in refs:
        refcount[r] = refcount.get(r, 0)+1;
        


# In[ ]:

#define mdb class
class MDB(object):
    def __init__(self):
        self.ip= dbIP
        self.port = dbPort
        self.cname = dbCollection
        
        self.client = pymongo.MongoClient(self.ip, self.port)
        self.db = self.client.vis
        self.coll = self.db[self.cname]
    
    def search(self, word):
        if(word==""):
            return {}
        word = word.lower()
        kw = self.coll.find({"Author Keywords":{"$in":[word]}})
        te = self.coll.find({"$text":{"$search":word}})
        
        print "from keyword: ", kw.count()
        print "from abstract & title: ", te.count()
        
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
        self.coll.create_index([("Abstract", pymongo.TEXT)])
        """
        db.main.createIndex({Abstract:"text","Paper Title":"text"})
        """
        


# In[ ]:

mdb = MDB()
mdb.insert(df)
mdb.createTextIndex();


#test
mdb.coll.find_one({"Year":1995})


