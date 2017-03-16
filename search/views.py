from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.db.models import Q
from django.shortcuts import redirect, render
from django.http import HttpResponse

from . import mdb

from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt 
def search0(request):
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
        data = mdb_hand.searchRiver(request.POST.get('content'))
        return HttpResponse(
            json.dumps(data),
            content_type="application/json"
        );
    return "ERROR!!!!!"



