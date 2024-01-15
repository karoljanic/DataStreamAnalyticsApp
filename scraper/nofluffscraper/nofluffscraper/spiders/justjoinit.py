import scrapy


def get_api_url(page_num):
    return f"https://api.justjoin.it/v2/user-panel/offers?&page={page_num}&sortBy=published&orderBy=DESC&perPage=100&salaryCurrencies=PLN"

class JustJoinItSpider(scrapy.Spider):
    name = "justjoinit"
    allowed_domains = ["justjoin.it/"]
    start_urls = ["https://justjoin.it/"]
    page = 1

    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "pl,en-US;q=0.7,en;q=0.3",
        "Version": "2",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "same-site",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
    }

    custom_settings = {
        "credentials": "omit",
        "referrer": "https://justjoin.it/",
        "method": "GET",
        "mode": "cors"
    }

    def start_requests(self):
        while self.page != None:
            yield scrapy.Request(url=get_api_url(self.page), method='GET', headers = self.headers, callback=self.parse)

    def parse(self, response):
        response_json = response.json()
        data = response_json['data']
        self.page = response_json['meta']['nextPage']
        for job in data:
            yield {
                'href': '/offers/' + job['slug']
            }
