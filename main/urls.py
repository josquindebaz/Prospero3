from django.urls import path
from . import views

urlpatterns = [
    path('ajax', views.ajaxCall),
    path('fileUpload', views.fileUpload),
    path('', views.index, name='index'),
    path('project', views.project, name='project'),
    path('projects-list', views.projects_list, name='projects_list'),
    path('projects-mosaic', views.projects_mosaic, name='projects_mosaic'),
    path('widgets', views.widgets, name='widgets')
]