
from api.models import DataSketch, DataStream, Tag, Type
from api.serializers import DataSketchSerializer, DataStreamSerializer, TagSerializer, TypeSerializer
from rest_framework import generics


class DataSketchList(generics.ListCreateAPIView):
    queryset = DataSketch.objects.all()
    serializer_class = DataSketchSerializer


class DataSketchDetail(generics.RetrieveUpdateDestroyAPIView):
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