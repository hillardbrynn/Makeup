from firecrawl import FirecrawlApp
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import json

load_dotenv()
app = FirecrawlApp(api_key=os.getenv("FIRECRAWL_API_KEY"))

json_schema = {
    "type": "object",
    "properties": {
        "products": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "brand": {"type": "string"},
                    "product_link": {"type": "string", "format": "uri"},
                    "product_name": {"type": "string"},
                    "product_type": {"type": "string"},
                    "product_image": {"type": "string", "format": "uri"},
                    "price": {"type": "number"},
                    "rating": {"type": "number"},
                    "color": {"type": "string"},
                    "skin_tone": {"type": "string"},
                    "under_tone": {"type": "string"},
                    "coverage_level": {"type": "string"},
                    "skin_type": {"type": "string"},
                    "allergies/restrictions": {"type": "string"}
                },
                "required": ["name", "brand", "price", "product_link", ""]
            }
        }
    },
    "required": ["products"]
}

# Perform the crawl
crawl_status = app.crawl_url(
    'https://www.sephora.com/shop/blush',
    params={
        'limit': 5,
        'scrapeOptions': {
            'formats': ['json'],
            'jsonOptions': {
                'schema': json_schema
            }
        }
    },
    poll_interval=30
)

# # Access the JSON output
results = crawl_status['data'][0]['json']['products']

# print(crawl_status)

if results:
    supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

    for product in results:
        brand = product['brand']
        product_link = product['product_link']
        product_name = product['product_name']
        product_type = product['product_type']
        product_image = product['product_image']
        price = product['price']
        rating = product['rating']
        color = product['color']
        skin_tone = product['skin_tone']
        under_tone = product['under_tone']
        coverage_level = product['coverage_level']
        skin_type = product['skin_type']
        restrictions = product['allergies/restrictions']

        response = (
            supabase.table("product")
            .insert({'brand': brand, 'link': product_link, 'name': product_name, 'type': product_type, 'image': product_image, 'price': price, 'rating': rating, 'color': color, 'skin_tone': skin_tone, 'under_tone': under_tone, 'coverage_level': coverage_level, 'skin_type': skin_tone, 'restrictions': restrictions})
            .execute()
        )
else:
    print("No data available in the crawl status")