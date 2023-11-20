from django.urls import path
from rest_framework.urlpatterns import format_suffix_patterns
from api import views

urlpatterns = [
    path('sketches/', views.DataSketchList.as_view()),
    path('sketches/<int:pk>/', views.DataSketchDetail.as_view()),

    path('streams/', views.DataStreamList.as_view()),

    path('tags/', views.TagList.as_view()),

    path('types/', views.TypeList.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)