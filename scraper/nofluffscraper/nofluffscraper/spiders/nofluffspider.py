import scrapy


class NofluffspiderSpider(scrapy.Spider):
    name = "nofluffspider"
    allowed_domains = ["nofluffjobs.com"]
    start_urls = ["http://nofluffjobs.com/"]

    def see_more_offers(self):
        pass

    def parse(self, response):
        jobs = response.css('a.posting-list-item')

        buttons = response.css('button')
        for button in buttons:
            yield {
                'button': button
            }

        for job in jobs:
            yield {
                'href': job.attrib['href']
            }
