from rest_framework import serializers
from api.models import DataStream, DataSketch, Tag, Type, Query

import datasketches
import base64

class DataStreamSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataStream
        fields = ['id', 'name']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'stream', 'name', 'category']

class TypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Type
        fields = ['id', 'stream', 'name', 'unit']

class DataStreamDetailSerializer(serializers.ModelSerializer):
    tags = TagSerializer(many=True, read_only=True)
    types = TypeSerializer(many=True, read_only=True)
    class Meta:
        model = DataStream
        fields = ['id', 'name', 'tags', 'types']


class InternalDataSketchField(serializers.Field):
    def to_representation(self, value):
        return base64.b64encode(value)

    def to_internal_value(self, data):
        return base64.b64decode(data)

class DataSketchSerializer(serializers.ModelSerializer):
    value = serializers.ReadOnlyField()
    sketch = InternalDataSketchField()
    class Meta:
        model = DataSketch
        fields = ['id', 'day', 'tag', 'typ', 'value', 'sketch']

class QuerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Query
        fields = ['id', 'tree_form', 'dnf']