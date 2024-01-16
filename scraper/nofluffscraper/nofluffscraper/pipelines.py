# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import json

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

        self.offers.append(item)

        skills = list(set(requiredSkills + niceToHaveSkills))

        self.locations[item['city']] = self.locations.get(item['city'], 0) + 1

        for skill in skills:
            self.skills_freq[skill] = self.skills_freq.get(skill, 0) + 1

        return None

    def close_spider(self, spider):
        top_skills = sorted(self.skills_freq.items(), key=lambda item: item[1], reverse=True)[:100]

        top_offers = [offer for offer in self.offers if set((offer['requiredSkills'] or []) + (offer['niceToHaveSkills'] or []))]
        with open('skills.txt', 'w') as f:
            for skill, freq in top_skills:
                f.write(f"{skill}: {freq}\n")

        print("Number of offers: ", len(self.offers))

        with open('locations.txt', 'w') as f:
            for location, freq in sorted(self.locations.items(), key=lambda item: item[1], reverse=True):
                f.write(f"{location}: {freq}\n")

        with open('offers.json', 'w') as f:
            json.dump(top_offers, f, indent=4, ensure_ascii=False)
        
