from rest_framework import serializers
from api.models import DataStream, DataSketch, Tag, Type

import datasketches
import base64

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
