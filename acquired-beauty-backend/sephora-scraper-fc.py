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
                "required": ["brand", "product_link", "product_name", "product_type", "product_image", "price"]
            }
        }
    },
    "required": ["products"]
}

# Perform the crawl specifically for blush products
crawl_status = app.crawl_url(
    'https://www.sephora.com/shop/blush',  # Changed URL to blush-specific category
    params={
        'limit': 50,  # Increased limit to get more blush products
        'scrapeOptions': {
            'formats': ['json'],
            'jsonOptions': {
                'schema': json_schema
            }
        }
    },
    poll_interval=30
)

# Access the JSON output
results = crawl_status['data'][0]['json']['products'] if crawl_status.get('data') and len(crawl_status['data']) > 0 else []

# Print crawl status for debugging
print(f"Crawled {len(results)} blush products")

if results:
    supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))
    
    # Get existing products from the database to check for duplicates
    existing_products = supabase.table("product").select("name", "brand", "link").execute()
    existing_products_set = set()
    
    # Create a set of unique identifiers (brand + name + link) for existing products
    if existing_products.data:
        for item in existing_products.data:
            unique_key = f"{item.get('brand', '').lower()}_{item.get('name', '').lower()}_{item.get('link', '').lower()}"
            existing_products_set.add(unique_key)
    
    print(f"Found {len(existing_products_set)} existing products in database")
    
    inserted_count = 0
    skipped_count = 0
    for product in results:
        # Extract product data with safe gets to handle missing fields
        brand = product.get('brand', '')
        product_link = product.get('product_link', '')
        product_name = product.get('product_name', '')
        product_type = product.get('product_type', 'Blush')  # Default to Blush
        product_image = product.get('product_image', '')
        price = product.get('price', 0)
        rating = product.get('rating', 0)
        color = product.get('color', '')
        skin_tone = product.get('skin_tone', '')
        under_tone = product.get('under_tone', '')
        coverage_level = product.get('coverage_level', '')
        skin_type = product.get('skin_type', '')
        restrictions = product.get('allergies/restrictions', '')
        
        # Only process products if they have required fields
        if brand and product_name and product_link:
            # Create unique identifier for this product
            unique_key = f"{brand.lower()}_{product_name.lower()}_{product_link.lower()}"
            
            # Check if this product already exists in the database
            if unique_key in existing_products_set:
                print(f"Skipping duplicate product: {brand} - {product_name}")
                skipped_count += 1
                continue
                
            try:
                response = (
                    supabase.table("product")
                    .insert({
                        'brand': brand, 
                        'link': product_link, 
                        'name': product_name, 
                        'type': product_type, 
                        'image': product_image, 
                        'price': price, 
                        'rating': rating, 
                        'color': color, 
                        'skin_tone': skin_tone, 
                        'under_tone': under_tone, 
                        'coverage_level': coverage_level, 
                        'skin_type': skin_type, 
                        'restrictions': restrictions
                    })
                    .execute()
                )
                inserted_count += 1
                # Add to existing products set to prevent duplicates within this batch
                existing_products_set.add(unique_key)
            except Exception as e:
                print(f"Error inserting product {product_name}: {str(e)}")
    
    print(f"Successfully inserted {inserted_count} blush products into the database")
    print(f"Skipped {skipped_count} duplicate blush products")
else:
    print("No blush products found in the crawl")