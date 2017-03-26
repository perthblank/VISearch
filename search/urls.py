from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^line/$', views.searchLine),
    url(r'^river/$', views.searchRiver),
    url(r'^list/$', views.searchList),
]
