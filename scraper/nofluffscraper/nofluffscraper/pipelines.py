# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import json
import sketches

class NofluffscraperPipeline:
    def process_item(self, item, spider):
        return item

class JustJoinItPipeline:
    def __init__(self):
        self.offers = []
        self.skills_freq = {}
        self.locations = {}

    def process_item(self, item, spider):
        requiredSkills = item['requiredSkills'] or []
        niceToHaveSkills = item['niceToHaveSkills'] or []

        skills = list(set(requiredSkills + niceToHaveSkills))

        item['skills'] = skills

        self.offers.append(item)

        self.locations[item['city']] = self.locations.get(item['city'], 0) + 1

        for skill in skills:
            self.skills_freq[skill] = self.skills_freq.get(skill, 0) + 1

        return None

    def close_spider(self, spider):
        top_skills = sorted(self.skills_freq.items(), key=lambda item: item[1], reverse=True)[:100]

        top_offers = [offer for offer in self.offers if offer['skills'] in top_skills]
        with open('skills.txt', 'w') as f:
            for skill, freq in top_skills:
                f.write(f"{skill}: {freq}\n")

        datastream = sketches.DataStream(1, 0)
        skillTags = { skill[0] : datastream.getOrAddTagId(skill[0], "Required skill") for skill in top_skills }

        for offer in top_offers:
            hash = int(hash(offer['title']))
            tags = [skillTags[skill] for skill in offer['skills']]
            datastream.addData(sketches.DataPoint(hash,tags))        
