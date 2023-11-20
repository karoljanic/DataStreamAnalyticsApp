from rest_framework import serializers
from api.models import DataStream, DataSketch, Tag, Type

class DataStreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataStream
        fields = ['id', 'name']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'stream', 'name']

class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = ['id', 'stream', 'name']

class DataSketchSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSketch
        fields = ['id', 'day', 'tag', 'typ', 'sketch']