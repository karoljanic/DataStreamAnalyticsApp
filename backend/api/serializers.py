from rest_framework import serializers
from api.models import DataStream, DataSketch, Tag

class DataStreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataStream
        fields = ['id', 'name']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class DataSketchSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSketch
        fields = ['id', 'stream', 'day', 'tag', 'typ', 'sketch']