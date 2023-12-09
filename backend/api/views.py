
from api.models import DataSketch, DataStream, Tag, Type, Query
from api.serializers import DataSketchSerializer, DataStreamSerializer, TagSerializer, TypeSerializer, QuerySerializer
from rest_framework import generics, mixins
from rest_framework.views import APIView

class DataSketchList(generics.ListCreateAPIView):
    queryset = DataSketch.objects.all()
    serializer_class = DataSketchSerializer

class DataSketchDetail(generics.RetrieveDestroyAPIView):
    queryset = DataSketch.objects.all()
    serializer_class = DataSketchSerializer

class TagList(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    

class TypeList(generics.ListCreateAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer
    

class DataStreamList(generics.ListCreateAPIView):
    queryset = DataStream.objects.all()
    serializer_class = DataStreamSerializer

class QueryList(generics.ListCreateAPIView):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer