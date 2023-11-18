import xml.etree.ElementTree as ET
import json
import re
import sys
import os
import argparse

def parse_xml_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            xml_data = file.read()

        root = ET.fromstring(xml_data)
        file_data = []

        for item in root.findall('.//item'):
            data = {
                'title': item.find('title').text if item.find('title') is not None else None,
                'location': None,
                'salary': None,
                # 'salary_string': None,
                'published_date': item.find('pubDate').text if item.find('pubDate') is not None else None,
                'date': os.path.splitext(os.path.basename(file_path))[0]
            }

            description = item.find('description').text if item.find('description') is not None else ''
            location_match = re.search(r'<b>Location:</b>\s*([^<]+)', description)

            range_salary_match = re.search(r'from (\d+) to (\d+) ([A-Z]+)(?: per (day|month|hour|year))?', description, re.IGNORECASE)
            single_salary_match = re.search(r'(\d+) ([A-Z]+)(?: per (day|month|hour|year))?', description, re.IGNORECASE)

            if "Unpaid internship" in description:
                data['salary'] = "Unpaid internship"
                # data['salary_string'] = "Unpaid internship"
            elif range_salary_match:
                salary_info = {
                    'from': int(range_salary_match.group(1)),
                    'to': int(range_salary_match.group(2)),
                    'currency': range_salary_match.group(3)
                }
                if range_salary_match.group(4):
                    salary_info['time_range'] = range_salary_match.group(4).lower()
                data['salary'] = salary_info
                # data['salary_string'] = range_salary_match.group(0)
            elif single_salary_match:
                salary_info = {
                    'value': int(single_salary_match.group(1)),
                    'currency': single_salary_match.group(2)
                }
                if single_salary_match.group(3):
                    salary_info['time_range'] = single_salary_match.group(3).lower()
                data['salary'] = salary_info
                # data['salary_string'] = single_salary_match.group(0)

            if location_match:
                data['location'] = location_match.group(1).strip()

            file_data.append(data)

        return file_data

    except Exception as e:
        print(f"Warning: Failed to parse '{file_path}': {e}")
        return []


def parse_xml_directory(directory_path, output_file):
    if not os.path.isdir(directory_path):
        print(f"Provided path {directory_path} is not a directory.")
        return

    xml_files = [f for f in os.listdir(directory_path) if f.endswith('.xml')]
    total_files = len(xml_files)
    combined_data = []

    for i, filename in enumerate(xml_files):
        file_path = os.path.join(directory_path, filename)
        combined_data.extend(parse_xml_file(file_path))
        print(f"Processed {i + 1}/{total_files} files...", end='\r')

    print(f"Finished processing {total_files}/{total_files} files. Writing to '{output_file}'...")

    with open(output_file, 'w', encoding='utf-8') as json_file:
        json.dump(combined_data, json_file, ensure_ascii=False, indent=4)

    print("Processing complete.")


def main():
    arg_parser = argparse.ArgumentParser(description="Parse XML files in a directory and output to a JSON file.")
    arg_parser.add_argument('input_directory', type=str, help="Directory containing XML files to parse")
    arg_parser.add_argument('-o', '--output', type=str, default='combined_data.json', help="Output JSON file name (default: combined_data.json)")

    args = arg_parser.parse_args()

    parse_xml_directory(args.input_directory, args.output)

if __name__ == '__main__':
    main()
