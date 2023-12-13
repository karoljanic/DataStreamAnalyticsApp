
from datetime import date, timedelta
from api.models import DataSketch, DataStream, Tag, Type, Query
from api.serializers import DataSketchSerializer, DataStreamSerializer, DataStreamDetailSerializer, TagSerializer, TypeSerializer, QuerySerializer
from rest_framework import generics, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from datasketches import compute_dnf, DataSketch as DS

class DataSketchList(generics.ListCreateAPIView):
    queryset = DataSketch.objects.all()
    serializer_class = DataSketchSerializer
    permission_classes = []

class DataSketchDetail(generics.RetrieveDestroyAPIView):
    queryset = DataSketch.objects.all()
    serializer_class = DataSketchSerializer
    permission_classes = []

class TagList(generics.ListCreateAPIView):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = []

class TypeList(generics.ListCreateAPIView):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer
    permission_classes = []
    
class DataStreamList(generics.ListCreateAPIView):
    queryset = DataStream.objects.all()
    serializer_class = DataStreamSerializer
    permission_classes = []
    pagination_class = None

class DataStreamDetail(generics.RetrieveDestroyAPIView):
    queryset = DataStream.objects.all()
    serializer_class = DataStreamDetailSerializer
    permission_classes = []

class QueryList(generics.ListCreateAPIView):
    queryset = Query.objects.all()
    serializer_class = QuerySerializer

class QueryResult(APIView):
    def get(self, request, pk):
        start_date = date.fromisoformat(self.request.GET["start-date"])
        end_date = date.fromisoformat(self.request.GET["end-date"])
        days = [start_date + timedelta(days=x) for x in range((end_date-start_date).days + 1)]
        typ = int(self.request.GET["type"])

        query = Query.objects.get(pk=pk)
        sketches_symbols = query.dnf['symbols']
        dnf = query.dnf['table']

        result = []
        for day in days:
            try:
                result.append({ "day": str(day), "value": self.value_in_day(day, typ, sketches_symbols, dnf)})
            except Exception as e: 
                print(day)
                print(e)

        return Response(result)
    
    def value_in_day(self, day, typ, symbols, dnf):
        sketches_bytes = [DataSketch.objects.filter(day=day).filter(typ=typ).filter(tag=s).get().sketch for s in symbols]
        sketches = []
        for b in sketches_bytes:
            d = DS()
            d.from_bytes(bytes(b))
            sketches.append(d)

        computed = compute_dnf(sketches, dnf)

        return computed
    
class QueryRandom(APIView):
    pagination_class = None

    def get(self, request, num):
        queries = Query.objects.order_by("-id").all()[:num]
        result = [QuerySerializer(query).data for query in queries]

        return Response(result)