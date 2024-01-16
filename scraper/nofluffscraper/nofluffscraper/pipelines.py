# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import json
import nofluffscraper.sketches as sketches

class NofluffscraperPipeline:
    def process_item(self, item, spider):
        return item

class JustJoinItPipeline:
    def __init__(self):
        self.offers = []
        self.skills_freq = {}
        self.locations = {}
        self.worktypes = {}
        self.experiences = {}
        self.worktimes = {}

    def process_item(self, item, spider):
        requiredSkills = item['requiredSkills'] or []
        niceToHaveSkills = item['niceToHaveSkills'] or []

        skills = list(set(requiredSkills + niceToHaveSkills))

        item['skills'] = skills
        item['workplaceType'] = item['workplaceType'].replace('_',' ').title()
        item['experienceLevel'] = item['experienceLevel'].replace('_',' ').title()
        item['workingTime'] = item['workingTime'].replace('_',' ').title()

        self.offers.append(item)

        self.locations[item['city']] = self.locations.get(item['city'], 0) + 1
        self.worktypes[item['workplaceType']] = self.worktypes.get(item['workplaceType'], 0) + 1
        self.experiences[item['experienceLevel']] = self.experiences.get(item['experienceLevel'], 0) + 1
        self.worktimes[item['workingTime']] = self.worktimes.get(item['workingTime'], 0) + 1
        for skill in skills:
            self.skills_freq[skill] = self.skills_freq.get(skill, 0) + 1


        return None

    def close_spider(self, spider):
        top_skills = sorted(self.skills_freq.items(), key=lambda item: item[1], reverse=True)[:100]
        top_locations = sorted(self.locations.items(), key=lambda item: item[1], reverse=True)[:11]

        top_offers = [offer for offer in self.offers]

        datastream = sketches.DataStream(2, 8)
        skillTags = { skill[0] : datastream.getOrAddTagId(skill[0], "Required skill") for skill in top_skills }
        locationTags = { location[0] : datastream.getOrAddTagId(location[0], "Location") for location in top_locations }
        workplaceTags = { tag : datastream.getOrAddTagId(tag, "Workplace Type") for tag in self.worktypes.keys() }
        worktimeTags = { tag : datastream.getOrAddTagId(tag, "Work Time") for tag in self.worktimes.keys() }
        expTags = { tag : datastream.getOrAddTagId(tag, "Experience") for tag in self.experiences.keys() }

        for offer in top_offers:
            offerHash = int(hash(offer['slug']))
            tags = [skillTags[skill] for skill in offer['skills'] if skill in skillTags.keys()]
            datastream.addData(sketches.DataPoint(offerHash,tags))  

            location = offer['city']
            if location in locationTags.keys():
                loctag = locationTags[location]
                datastream.addData(sketches.DataPoint(offerHash,[loctag]))

            worktypetag = workplaceTags[offer['workplaceType']]
            exptag = expTags[offer['experienceLevel']]
            timetag = worktimeTags[offer['workingTime']]
            
            datastream.addData(sketches.DataPoint(offerHash, [worktypetag, exptag, timetag]))


        datastream.saveStream()      
