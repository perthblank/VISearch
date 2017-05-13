from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^list/$', views.searchList),
    url(r'^n/$', views.search),
    url(r'^cloud/$', views.searchCloud),
]
