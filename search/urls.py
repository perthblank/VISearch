from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.search0, name='index'),
    url(r'^river/$', views.searchRiver),
]
