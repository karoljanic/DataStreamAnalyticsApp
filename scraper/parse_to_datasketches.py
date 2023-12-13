import parse_historic_data
import datasketches
import xml.etree.ElementTree as ET
import json
import re
import sys
import os
import argparse
import requests
import base64

tags = [
    ["senior", "experience"],
    ["mid", "experience"],
    ["junior", "experience"],
    ["manager", "experience"],
    ["lead", "experience"],
    ["frontend", "role"],
    ["backend", "role"],
    ["fullstack", "role"],
    ["automation", "role"],
    ["administrator", "role"],
    ["architect", "role"],
    ["analyst", "role"],
    ["devops", "role"],
    ["embedded", "role"],
    ["tester", "role"],
    ["c++", "technology"],
    [".net", "technology"],
    ["java", "technology"],
    ["php", "technology"],
    ["python", "technology"],
    ["javascript", "technology"],
    ["ruby", "technology"],
    ["scala", "technology"],
    ["react", "technology"],
    ["angular", "technology"],
    ["cloud", "technology"],
    ["web", "technology"],
    ["android", "technology"],
    ["ios", "technology"],
    ["remote", "other"],
]

# url = "https://datastream-analytics.fly.dev/api/"
url = "http://127.0.0.1:8000/api/"
streams_url = url + "streams/"
tags_url = url + "tags/"
types_url = url + "types/"
sketches_url = url + "sketches/"

def parse_directory(directory_path):
    if not os.path.isdir(directory_path):
        print(f"Provided path {directory_path} is not a directory.")
        return

    xml_files = [f for f in os.listdir(directory_path) if f.endswith('.xml')]
    total_files = len(xml_files)

    s = requests.Session()

    for j, filename in enumerate(xml_files):
        file_path = os.path.join(directory_path, filename)

        xml_file = parse_historic_data.parse_xml_file(file_path)
        
        if len(xml_file) == 0:
            continue

        for i, tag in enumerate(tags):
            tag_name = tag[0]

            datasketch = datasketches.DataSketch()
            for offer in xml_file:
                if not tag_name in offer['title'].lower():
                    continue
                identifier = int(hash(offer['title']))
                value = 1.0
                sample = datasketches.Sample(identifier, value)
                datasketch.update_from_sample(sample)

            datasketch_bytes = base64.b64encode(datasketch.to_bytes())
            date = xml_file[0]['date']

            r = s.post(sketches_url, data={ "tag": i + 1, "typ": 1, "day": date, "sketch": datasketch_bytes })
            print("Tag", i+1, "Date", date,datasketch.read_value(),  r)

        print(f"Processed {j + 1}/{total_files} files...")

def main():

    r = requests.post(streams_url, data={ "name": "historic" })
    print("Stream create", r)

    r = requests.post(types_url, data={ "stream": 1, "name": "count", "unit": "" })
    print("Type create", r)

    for tag in tags:
        r = requests.post(tags_url, data={ "stream": 1, "name": tag[0], "category": tag[1] })
        print("Tag create", r)

    arg_parser = argparse.ArgumentParser(description="Parse XML files in a directory and output to a JSON file.")
    arg_parser.add_argument('input_directory', type=str, help="Directory containing XML files to parse")

    args = arg_parser.parse_args()

    parse_directory(args.input_directory)

if __name__ == '__main__':
    main()
