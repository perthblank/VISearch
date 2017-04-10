from django.shortcuts import render
from django.http import HttpResponse
import json

class OptionConfig:

    def __init__(self):

        self.keywords_te = "Keywords"
        self.text_te = "Title&Abstract"

        self.cited_te = "Cited Time"
        self.freq_te = "Frequency"
        
        self.__navOptions = [
                {"label": "Chart Type", "options": ["River", "Heat", "Line"]},
                {"label": "Search With", "options": [self.keywords_te, self.text_te]},
                {"label": "Criterion", "options": [self.freq_te, self.cited_te]}
                ]

    def navOptions(self):
        return self.__navOptions


def index(request):
    optionConfig = OptionConfig()
    context = {"navOptions":optionConfig.navOptions()}
    context["jsonstr"] = json.dumps(context);

    return render(request,'index/index.html', context )

# Create your views here.
