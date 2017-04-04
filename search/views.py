from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.http import JsonResponse

from . import mdb

from django.views.decorators.csrf import csrf_exempt
import json

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
def searchRiver(request):
    if request.method == "POST":
        mdb_hand = mdb.MDB()
        data = mdb_hand.searchRiver(request.POST.get('content'), request.POST.get('qtype'))
        return HttpResponse(
            json.dumps(data),
            content_type="application/json"
        );
    return "ERROR!!!!!"

@csrf_exempt 
def searchList(request):
    if request.method == "POST":
        mdb_hand = mdb.MDB()
        req = json.loads(request.POST.get('dataStr'))
        data = mdb_hand.searchList(req)
        return HttpResponse(
            json.dumps(data),
            content_type="application/json"
        );
    return "ERROR!!!!!"


@csrf_exempt 
def searchHeat(request):
    if request.method == "POST":
        mdb_hand = mdb.MDB()
        data = mdb_hand.searchHeat(request.POST.get('content'), request.POST.get('qtype'))
        #print data
        return JsonResponse(data);
        #return HttpResponse(
        #    json.dumps(data),
        #    content_type="application/json"
        #);
    return "ERROR!!!!!"

