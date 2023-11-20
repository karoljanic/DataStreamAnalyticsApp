
from api.models import DataSketch, DataStream, Tag
from api.serializers import DataSketchSerializer, DataStreamSerializer, TagSerializer
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


class TagDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    

class DataStreamList(generics.ListCreateAPIView):
    queryset = DataStream.objects.all()
    serializer_class = DataStreamSerializer


class DataStreamDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = DataStream.objects.all()
    serializer_class = DataStreamSerializer