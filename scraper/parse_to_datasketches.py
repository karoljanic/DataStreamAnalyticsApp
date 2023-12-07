import parse_historic_data
import datasketches
import xml.etree.ElementTree as ET
import json
import re
import sys
import os
import argparse

tags = [
    "senior",
    "java",
    "junior",
    "frontend | front-end",
    ".net",
    "devops",
    "php",
    "fullstack",
    "python",
    "remote",
    "javascript",
    "automation",
    "manager",
    "android",
    "backend",
    "react",
    "analyst",
    "ios",
    "lead",
    "ruby | rails (ruby on rails)",
    "administrator",
    "architect",
    "c++",
    "anuglar",
    "mid/senior",
    "scala",
    "web",
    "mid",
    "cloud",
    "embedded",
    "tester"
]

def parse_directory(directory_path, output_file):
    if not os.path.isdir(directory_path):
        print(f"Provided path {directory_path} is not a directory.")
        return

    xml_files = [f for f in os.listdir(directory_path) if f.endswith('.xml')]
    total_files = len(xml_files)

    for i, filename in enumerate(xml_files):
        file_path = os.path.join(directory_path, filename)

        xml_file = parse_historic_data.parse_xml_file(file_path)

        for tag in tags:
            datasketch = datasketches.DataSketch()
            for offer in xml_file:
                if not tag in offer['title']:
                    continue
                identifier = int(hash(offer['title']))
                value = 1.0
                sample = Sample(identifier, value)
                datasketch.update_from_sample(sample)

            print(datasketch)



        print(f"Processed {i + 1}/{total_files} files...", end='\r')

    print(f"Finished processing {total_files}/{total_files} files. Writing to '{output_file}'...")

def main():
    arg_parser = argparse.ArgumentParser(description="Parse XML files in a directory and output to a JSON file.")
    arg_parser.add_argument('input_directory', type=str, help="Directory containing XML files to parse")
    arg_parser.add_argument('-o', '--output', type=str, default='combined_data.json', help="Output JSON file name (default: combined_data.json)")

    args = arg_parser.parse_args()

    parse_historic_data.parse_xml_directory(args.input_directory, args.output)

if __name__ == '__main__':
    main()
