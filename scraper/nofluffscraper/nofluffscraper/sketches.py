import base64
import requests
import datasketches
import datetime

url = "http://127.0.0.1:8000/api/"
streams_url = url + "streams/"
tags_url = url + "tags/"
types_url = url + "types/"
sketches_url = url + "sketches/"

class DataPoint:
    def __init__(self, hash, tags, weight = 1) -> None:
        self.hash = hash
        self.tags = tags
        self.weight = weight

class DataStream:
    def __init__(self, streamId: int, typeId: int) -> None:
        self.streamId = streamId
        self.typeId = typeId
        self.streamMeta = requests.get(streams_url + str(streamId) + "/").json()
        self.streamTags = { tag['name'] : tag['id'] for tag in self.streamMeta['tags'] }
        self.data = []

    def getOrAddTagId(self, name, category):
        if name in self.streamTags.keys():
            return self.streamTags[name]
        else:
            r = requests.post(tags_url, data={ "stream": self.streamId, "name": name, "category": category })
            streamTag = r.json()
            id = streamTag['id']
            self.streamTags[name] = id
            print("Added tag:", streamTag)
            return id

    def addData(self, datapoint: DataPoint):
        self.data.append(datapoint)

    def saveStream(self):
        sketches = { tagId : datasketches.DataSketch() for tagId in self.streamTags.values() }

        for datapoint in self.data:
            for tag in datapoint.tags:
                ds = sketches[tag]
                sample = datasketches.Sample(datapoint.hash, datapoint.weight)
                ds.update_from_sample(sample)

        date = datetime.date.today()
        s = requests.Session()

        for (tagId, sketch) in sketches.items():
            ds_bytes = base64.b64encode(sketch.to_bytes())

            r = s.post(sketches_url, data={ "tag": tagId, "typ": self.typeId, "day": date, "sketch": ds_bytes })
            print("Pushed sketch:", date, tagId, self.typeId, r)
