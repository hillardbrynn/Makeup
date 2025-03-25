from firecrawl import FirecrawlApp
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import json
import time
from tqdm import tqdm
import re

load_dotenv()

# Initialize clients
firecrawl_api_key = os.getenv("FIRECRAWL_API_KEY")
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not firecrawl_api_key:
    raise ValueError("FIRECRAWL_API_KEY is missing from environment variables")
if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY is missing from environment variables")

app = FirecrawlApp(api_key=firecrawl_api_key)
supabase = create_client(supabase_url, supabase_key)

# Check if table exists
def ensure_table_exists():
    try:
        response = supabase.table("sephoraproducts").select("id").limit(1).execute()
        print("Table sephoraproducts exists")
    except Exception as e:
        if "relation" in str(e) and "does not exist" in str(e):
            print("Table sephoraproducts does not exist")
            print("Please create the table in Supabase using the following SQL:")
            print("""
                CREATE TABLE sephoraproducts (
                    id SERIAL PRIMARY KEY,
                    brand VARCHAR(255),
                    name VARCHAR(255),
                    link VARCHAR(255) UNIQUE,
                    type VARCHAR(255),
                    image VARCHAR(255),
                    price NUMERIC,
                    rating NUMERIC,
                    color VARCHAR(255),
                    skin_tone VARCHAR(255),
                    under_tone VARCHAR(255),
                    coverage_level VARCHAR(255),
                    skin_type VARCHAR(255),
                    restrictions TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """)
            raise ValueError("Please create the sephoraproducts table in Supabase first, then run this script again")
        else:
            raise e

def crawl_category_page(category_url, max_pages=3):
    """
    Crawl a category page and extract all product links and basic data
    """
    all_products = []
    for page in range(1, max_pages + 1):
        # Add pagination parameter if needed
        page_url = f"{category_url}?currentPage={page}" if page > 1 else category_url
        print(f"\nCrawling page {page}: {page_url}")
        
        try:
            # Use a direct request approach
            response = app.crawl_url(
                page_url,
                params={
                    'limit': 0,  # Don't follow links
                    'outputFormat': 'html'  # Get the full HTML
                },
                poll_interval=15
            )
            
            # Extract product data from the HTML content
            if 'html' in response:
                html_content = response['html']
                
                # Use Firecrawl to extract structured data from the HTML
                structured_data = app.extract_structured_data(
                    html_content, 
                    {
                        "products": {
                            "listItem": "a[href*='/product/']",
                            "data": {
                                "url": {
                                    "attr": "href"
                                },
                                "brand": {
                                    "selector": "span[data-at='sku_item_brand']"
                                },
                                "name": {
                                    "selector": "span[data-at='sku_item_name']"
                                },
                                "price": {
                                    "selector": "span[data-at='sku_item_price_list']"
                                },
                                "rating": {
                                    "selector": "div[data-at='sku_item_rating']"
                                },
                                "image": {
                                    "selector": "img",
                                    "attr": "src"
                                }
                            }
                        }
                    }
                )
                
                if structured_data and 'products' in structured_data:
                    page_products = structured_data['products']
                    valid_products = []
                    
                    for product in page_products:
                        # Process and clean the product data
                        processed_product = process_product_data(product, category_url)
                        if processed_product:
                            valid_products.append(processed_product)
                    
                    print(f"Found {len(valid_products)} valid products on page {page}")
                    all_products.extend(valid_products)
                else:
                    print(f"No products found on page {page}")
            else:
                print("No HTML content in response")
            
            # Add delay between pages
            if page < max_pages:
                time.sleep(3)
                
        except Exception as e:
            print(f"Error processing page {page}: {str(e)}")
    
    return all_products

def process_product_data(product, category_url):
    """Process and clean product data"""
    # Skip if missing essential data
    if not product.get('url') or not product.get('name'):
        return None
    
    # Create full URL if it's relative
    url = product['url']
    if url.startswith('/'):
        url = f"https://www.sephora.com{url}"
    
    # Extract product type from the category URL
    product_type = extract_product_type(category_url)
    
    # Extract price as a number
    price = 0
    if product.get('price'):
        price_matches = re.findall(r'\$(\d+(\.\d+)?)', product['price'])
        if price_matches:
            try:
                price = float(price_matches[0][0])
            except:
                pass
    
    # Extract rating as a number
    rating = 0
    if product.get('rating'):
        rating_matches = re.findall(r'(\d+(\.\d+)?)', product['rating'])
        if rating_matches:
            try:
                rating = float(rating_matches[0][0])
            except:
                pass
    
    # Make sure image URL is complete
    image_url = product.get('image', '')
    if image_url and not image_url.startswith('http'):
        image_url = f"https://www.sephora.com{image_url}"
    
    return {
        'product_link': url,
        'brand': product.get('brand', ''),
        'product_name': product.get('name', ''),
        'product_type': product_type,
        'product_image': image_url,
        'price': price,
        'rating': rating
    }

def extract_product_type(category_url):
    """Extract product type from category URL"""
    url_parts = category_url.split('/')
    if len(url_parts) > 0:
        last_part = url_parts[-1]
        # Convert hyphenated names to title case
        return ' '.join(word.capitalize() for word in last_part.split('-'))
    return "Makeup"

def store_products(products):
    """Store products in Supabase database"""
    if not products:
        print("No products to store")
        return 0, 0
        
    successful = 0
    failed = 0
    
    print(f"Storing {len(products)} products in database")
    
    for product in tqdm(products):
        data = {
            'brand': product.get('brand', ''),
            'name': product.get('product_name', ''),
            'link': product.get('product_link', ''),
            'type': product.get('product_type', 'Makeup'),
            'image': product.get('product_image', ''),
            'price': product.get('price', 0),
            'rating': product.get('rating', 0)
        }
        
        try:
            response = (
                supabase.table("sephoraproducts")
                .upsert(data, on_conflict="link")
                .execute()
            )
            successful += 1
            
            if successful % 10 == 0:
                print(f"Stored {successful} products so far...")
                
        except Exception as e:
            print(f"Error storing product {data.get('name', 'unknown')}: {e}")
            failed += 1
    
    return successful, failed

def main():
    # Verify the table exists
    ensure_table_exists()
    
    # Define the category URL to scrape
    category_url = "https://www.sephora.com/shop/lipstick"
    
    # Number of pages to crawl (adjust as needed)
    max_pages = 3
    
    print(f"Starting to crawl: {category_url}")
    products = crawl_category_page(category_url, max_pages=max_pages)
    
    if products:
        print(f"\nFound {len(products)} products")
        successful, failed = store_products(products)
        
        print(f"\nScraping complete!")
        print(f"Successfully stored: {successful}")
        print(f"Failed to store: {failed}")
    else:
        print("No products found")

if __name__ == "__main__":
    main()