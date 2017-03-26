#load sheet into mongodb


# coding: utf-8


import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import re
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
import nltk
import math
import copy



filepath = "data.xlsx"
xl = pd.ExcelFile(filepath)
print xl.sheet_names



df0 = xl.parse("Main dataset")
df0.columns



criteria = ["Year","Paper Title", "Abstract", "Author Keywords", "Author Names", "References", "Conference", "Link"]
tosplit = ["Author Keywords"]
df = df0.loc[:,criteria]
        

import pymongo
import pprint

class MDB(object):
    def __init__(self):
        self.ip= "192.168.142.130"
        self.port = 27017
        self.cname = "main"
        
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
                    
            self.coll.insert_one(ent)
        
    

mdb = MDB()


mdb.insert(df)


mdb.search("volume")



"""
createIndex in mongo
db.main.createIndex({Abstract:"text","Paper Title":"text"})
"""
