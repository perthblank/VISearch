from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.http import JsonResponse

from . import mdb
from django.views.decorators.csrf import csrf_exempt
import json

from index.views import OptionConfig 

@csrf_exempt 
def searchLine(request):
    if request.method == "POST":
        mdb_hand = mdb.MDB()
        data = mdb_hand.searchPerYear(request.POST.get('content'))
        return HttpResponse(
            json.dumps(data),
            content_type="application/json"
        );
    return "ERROR!!!!!"


@csrf_exempt 
def searchList(request):
    if request.method != "POST":
        return "ERROR!!!!!"
    mdb_hand = mdb.MDB()
    meta = json.loads(request.POST.get('metaStr'))
    data = mdb_hand.searchList(meta)
    return HttpResponse(
        json.dumps({"res":data, "metaStr": request.POST.get('metaStr')}),
        content_type="application/json"
    );


@csrf_exempt 
def searchCloud(request):
    if request.method != "POST":
        return "ERROR!!!!!"
    mdb_hand = mdb.MDB()
    meta = json.loads(request.POST.get('metaStr'))
    data = mdb_hand.searchCloud(meta)
    return HttpResponse(
        json.dumps(data),
        content_type="application/json"
    );


@csrf_exempt 
def search(request):
    if request.method != "POST":
        return "ERROR!!!!!"

    oc = OptionConfig()
    mdb_hand = mdb.MDB()
    content = request.POST.get('content') 
    options = json.loads(request.POST.get('options'))
    qtype = options["Search From"]
    groupby = options["Group By"]
    criterion = options["Criterion"]

    if(options["Chart Type"]==oc.cloud_te):
        data = mdb_hand.searchCloud({"query":{"key":content}, "qtype":qtype})
    else:
        if(groupby == oc.conf_te):
            data = mdb_hand.groupbyConf(content, qtype, criterion, oc)
        else:
            data = mdb_hand.groupbyMulti(content, qtype, criterion, oc)

        data["criterion"] = criterion;
        data["groupby"] = groupby;

    return JsonResponse(data)


