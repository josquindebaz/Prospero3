from django.urls import path
from . import views

urlpatterns = [
    path('ajax', views.ajaxCall),
    path('', views.index, name='index'),
    path('widgets', views.widgets, name='widgets')
]