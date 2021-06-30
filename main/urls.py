from django.urls import path
from . import views

urlpatterns = [
    path('ajax', views.ajaxCall),
    path('fileUpload', views.fileUpload),
    path('', views.index, name='index'),
    path('project/<int:id>', views.project, name='project'),
    path('projects-list', views.projects_list, name='projects-list'),
    path('projects-mosaic', views.projects_mosaic, name='projects-mosaic'),
    path('widgets', views.widgets, name='widgets')
]