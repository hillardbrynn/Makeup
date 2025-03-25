import os
import re
import time
import json
import random
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm
from dotenv import load_dotenv
from supabase import create_client, Client
import logging
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# Set up logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY is missing from environment variables")

supabase = create_client(supabase_url, supabase_key)

# Check if table exists
def ensure_table_exists():
    try:
        response = supabase.table("sephoraproducts").select("id").limit(1).execute()
        logger.info("Table sephoraproducts exists")
    except Exception as e:
        if "relation" in str(e) and "does not exist" in str(e):
            logger.error("Table sephoraproducts does not exist")
            logger.info("Please create the table in Supabase using the following SQL:")
            logger.info("""
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

def get_headers():
    """Create realistic browser headers to avoid being blocked"""
    user_agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
    ]
    
    return {
        'User-Agent': random.choice(user_agents),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Referer': 'https://www.sephora.com/',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
        'DNT': '1'
    }

def create_session_with_retries():
    """Creates a session with retry logic"""
    session = requests.Session()
    retries = Retry(
        total=5,
        backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    adapter = HTTPAdapter(max_retries=retries)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

def get_page_with_retry(url, max_retries=3):
    """Fetch a page with retry logic and proper delays"""
    session = create_session_with_retries()
    retries = 0
    while retries < max_retries:
        try:
            # Add jitter to delay to appear more human-like
            time.sleep(random.uniform(3, 7))
            response = session.get(url, headers=get_headers(), timeout=30)
            
            if response.status_code == 200:
                return response
            
            # If we get a 429 (Too Many Requests), add longer delay
            if response.status_code == 429:
                wait_time = 30 + random.uniform(5, 15)
                logger.warning(f"Rate limited. Waiting {wait_time:.2f} seconds...")
                time.sleep(wait_time)
            else:
                logger.warning(f"Got status code {response.status_code} for {url}")
            
            retries += 1
        except Exception as e:
            logger.error(f"Error fetching {url}: {e}")
            retries += 1
            time.sleep(random.uniform(5, 10))
    
    return None

def save_debug_html(html_content, page_num):
    """Save HTML content to a file for debugging"""
    debug_dir = "debug_output"
    os.makedirs(debug_dir, exist_ok=True)
    
    filename = f"{debug_dir}/sephora_page_{page_num}.html"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html_content)
    logger.info(f"Saved HTML content to {filename} for debugging")
    return filename

def save_debug_json(json_data, name):
    """Save JSON content to a file for debugging"""
    debug_dir = "debug_output"
    os.makedirs(debug_dir, exist_ok=True)
    
    filename = f"{debug_dir}/{name}.json"
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(json_data, f, indent=2)
    logger.info(f"Saved JSON content to {filename} for debugging")
    return filename

def save_element_debug(element, index):
    """Save individual element HTML for debugging"""
    debug_dir = "debug_output"
    os.makedirs(debug_dir, exist_ok=True)
    
    filename = f"{debug_dir}/product_element_{index}.html"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(str(element))
    logger.info(f"Saved element HTML to {filename} for debugging")
    return filename

def extract_api_data(html_content):
    """Try to extract product data from any embedded API responses in the page"""
    products = []
    
    # Look for JSONP data in script tags
    match = re.search(r'window\.__PRELOADED_STATE__ = (.+?);\s*</script>', html_content)
    if match:
        try:
            state_data = json.loads(match.group(1))
            logger.info("Found PRELOADED_STATE data")
            save_debug_json(state_data, "preloaded_state")
            
            # Try to locate product data in the state object
            if 'entities' in state_data and 'products' in state_data['entities']:
                product_dict = state_data['entities']['products']
                logger.info(f"Found {len(product_dict)} products in PRELOADED_STATE")
                
                for product_id, product_data in product_dict.items():
                    try:
                        if 'currentSku' in product_data and 'brandName' in product_data:
                            product = {
                                'url': f"/product/{product_data.get('productId', '')}",
                                'brand': product_data.get('brandName', ''),
                                'name': product_data.get('displayName', ''),
                                'price': str(product_data.get('currentSku', {}).get('valuePrice', 0)),
                                'rating': str(product_data.get('rating', 0)),
                                'image': product_data.get('heroImage', '')
                            }
                            products.append(product)
                    except Exception as e:
                        logger.error(f"Error processing API product: {e}")
            
            # Check for products in page content/results
            if 'pageContent' in state_data:
                page_content = state_data['pageContent']
                if isinstance(page_content, dict) and 'results' in page_content:
                    for result in page_content['results']:
                        try:
                            if 'productId' in result and 'displayName' in result:
                                product = {
                                    'url': f"/product/{result.get('productId', '')}",
                                    'brand': result.get('brandName', ''),
                                    'name': result.get('displayName', ''),
                                    'price': str(result.get('currentSku', {}).get('valuePrice', 0) or 
                                                result.get('valuePrice', 0)),
                                    'rating': str(result.get('rating', 0)),
                                    'image': result.get('heroImage', '')
                                }
                                products.append(product)
                        except Exception as e:
                            logger.error(f"Error processing product from results: {e}")
        except Exception as e:
            logger.error(f"Error extracting API data: {e}")
    
    # Also look for GraphQL data or other API responses
    graphql_match = re.search(r'window\.__APOLLO_STATE__ = (.+?);\s*</script>', html_content)
    if graphql_match:
        try:
            apollo_data = json.loads(graphql_match.group(1))
            logger.info("Found APOLLO_STATE data")
            save_debug_json(apollo_data, "apollo_state")
            
            # Try to process Apollo state data
            # Look for products in the Apollo cache
            for key, value in apollo_data.items():
                if isinstance(value, dict):
                    # Check if this looks like a product
                    if 'brandName' in value and 'displayName' in value:
                        try:
                            product_id = value.get('productId', '')
                            if product_id:
                                product = {
                                    'url': f"/product/{product_id}",
                                    'brand': value.get('brandName', ''),
                                    'name': value.get('displayName', ''),
                                    'price': str(value.get('valuePrice', 0)),
                                    'rating': str(value.get('rating', 0)),
                                    'image': value.get('heroImage', '')
                                }
                                products.append(product)
                        except Exception as e:
                            logger.error(f"Error processing product from Apollo data: {e}")
        except Exception as e:
            logger.error(f"Error extracting Apollo data: {e}")
    
    # Look for any direct JS variables or data structures that might contain product info
    # This is a more aggressive approach
    product_data_matches = re.findall(r'var\s+productData\s*=\s*({.+?});', html_content)
    for match in product_data_matches:
        try:
            product_data = json.loads(match)
            if isinstance(product_data, dict) and 'sku' in product_data and 'brand' in product_data:
                product = {
                    'url': product_data.get('url', ''),
                    'brand': product_data.get('brand', ''),
                    'name': product_data.get('name', ''),
                    'price': str(product_data.get('price', 0)),
                    'rating': str(product_data.get('rating', 0)),
                    'image': product_data.get('image', '')
                }
                products.append(product)
        except Exception as e:
            logger.error(f"Error parsing direct product data: {e}")
    
    return products

def extract_price_from_text(text):
    """Extract price from product text"""
    # Handle multiple price formats like "$15.00", "$15.00 - $25.00", "15", etc.
    if not text:
        return 0
    
    # First, try to find a price pattern like $XX.XX
    price_matches = re.findall(r'\$(\d+(?:\.\d+)?)', text)
    if price_matches:
        try:
            # If there are multiple prices, take the first one
            price = float(price_matches[0])
            return price
        except:
            pass
    
    # If no $ format, try to find just numbers that could be prices
    number_matches = re.findall(r'(\d+(?:\.\d+)?)', text)
    if number_matches:
        for match in number_matches:
            try:
                num = float(match)
                # Only consider it a price if it's reasonable (between 1 and 200)
                if 1 <= num <= 200:
                    return num
            except:
                pass
    
    return 0

def extract_rating_from_text(text):
    """Extract rating from product text"""
    if not text:
        return 0
    
    # Look for patterns like "4.5K" (for 4.5 thousand reviews)
    k_match = re.search(r'(\d+(?:\.\d+)?)K', text)
    if k_match:
        try:
            return float(k_match.group(1))
        except:
            pass
    
    # Look for plain numbers that could be ratings
    rating_matches = re.findall(r'(\d+(?:\.\d+)?)', text)
    if rating_matches:
        for match in rating_matches:
            try:
                rating = float(match)
                # Ratings are typically between 0 and 5
                if 0 <= rating <= 5:
                    return rating
            except:
                pass
    
    return 0

def extract_product_data(product_el):
    """Extract structured data from a product element"""
    product_data = {}
    
    # Extract URL - most critical piece
    url = product_el.get('href', '')
    if not url:
        return None
    product_data['url'] = url
    
    # Get full text content for extracting data
    full_text = product_el.get_text(strip=True)
    
    # Extract data using a set of selectors for each field
    selector_mapping = {
        'brand': [
            'span[data-at="sku_item_brand"]', 
            '.css-cjz2sh', 
            '.css-ktoumz',
            '[data-comp="BrandName"]',
            'span[data-at="brand_name"]'
        ],
        'name': [
            'span[data-at="sku_item_name"]', 
            '.css-bpsjlq', 
            '.css-1n1cap4',
            '[data-comp="DisplayName"]',
            'span[data-at="product_name"]'
        ],
        'price': [
            'span[data-at="sku_item_price_list"]', 
            '.css-1nhzng0', 
            '.css-o0sbai',
            '[data-comp="Price"]',
            'span[data-at="price"]'
        ],
        'rating': [
            'div[data-at="sku_item_rating"]', 
            '.css-1grx9ln', 
            '.css-14lnvpw',
            '[data-comp="StarRating"]',
            'div[data-at="rating"]'
        ]
    }
    
    # Process each field using the selectors
    for field, selectors in selector_mapping.items():
        for selector in selectors:
            el = product_el.select_one(selector)
            if el:
                product_data[field] = el.text.strip()
                break
    
    # Image extraction
    img_el = product_el.select_one('img')
    if img_el:
        for attr in ['src', 'data-src', 'data-default-src']:
            if img_el.has_attr(attr) and img_el[attr]:
                product_data['image'] = img_el[attr]
                break
    
    # Apply fallbacks for missing data
    if 'brand' not in product_data or not product_data.get('brand'):
        # Try to extract brand from full text or other pattern
        text_parts = full_text.split()
        if "Quicklook" in full_text and len(text_parts) > 1:
            start_idx = full_text.find("Quicklook") + len("Quicklook")
            potential_brand = full_text[start_idx:].split()[0]
            if potential_brand and potential_brand not in ["New", "Limited", "Online"]:
                product_data['brand'] = potential_brand
    
    if 'name' not in product_data or not product_data.get('name'):
        product_data['name'] = extract_name_from_url(url)
    
    if 'price' not in product_data or not product_data.get('price'):
        price_value = extract_price_from_text(full_text)
        if price_value > 0:
            product_data['price'] = f"${price_value}"
    
    if 'rating' not in product_data or not product_data.get('rating'):
        rating_value = extract_rating_from_text(full_text)
        if rating_value > 0:
            product_data['rating'] = str(rating_value)
    
    return product_data

def determine_working_pagination_pattern(category_url):
    """Test different pagination patterns to find one that works"""
    pagination_patterns = [
        lambda p: f"{category_url}?currentPage={p}" if p > 1 else category_url,
        lambda p: f"{category_url}?page={p}" if p > 1 else category_url,
        lambda p: f"{category_url}&page={p}" if p > 1 else category_url
    ]
    
    for pattern in pagination_patterns:
        test_url = pattern(2)  # Test with page 2
        logger.info(f"Testing pagination pattern: {test_url}")
        
        response = get_page_with_retry(test_url)
        if not response:
            continue
            
        if response.status_code == 200:
            soup = BeautifulSoup(response.text, 'html.parser')
            if soup.select('a[href*="/product/"]'):
                logger.info(f"Found working pagination pattern: {test_url}")
                return pattern
    
    logger.error("Could not determine working pagination pattern")
    # Default to first pattern as fallback
    return pagination_patterns[0]

def crawl_category_page(category_url, max_pages=10):
    """
    Crawl a category page with improved handling of pagination, duplicates, and data extraction
    """
    all_products = []
    products_seen = {}  # Keep track of URLs we've already seen, with their data
    
    # Find a working pagination pattern first
    pagination_pattern = determine_working_pagination_pattern(category_url)
    
    # Track consecutive empty pages to detect end of products
    consecutive_empty_pages = 0
    
    for page in range(1, max_pages + 1):
        page_url = pagination_pattern(page)
        logger.info(f"Crawling page {page}: {page_url}")
        
        # Get the page with retry logic
        response = get_page_with_retry(page_url)
        if not response:
            logger.error(f"Failed to fetch page {page} after multiple retries")
            consecutive_empty_pages += 1
            if consecutive_empty_pages >= 2:
                logger.warning(f"Multiple consecutive failures. Stopping pagination at page {page}.")
                break
            continue
        
        # Parse the HTML content
        html_content = response.text
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Save HTML for debugging
        debug_file = save_debug_html(html_content, page)
        logger.info(f"Saved HTML to {debug_file} for further inspection")
        
        # Initialize a flag to track if any products were found on this page
        products_found_on_page = False
        
        # Try to extract data from API embedded in page (priority)
        api_products = extract_api_data(html_content)
        if api_products:
            logger.info(f"Found {len(api_products)} products from embedded API data")
            for product in api_products:
                processed = process_product_data(product, category_url)
                if processed:
                    product_link = processed['product_link']
                    if product_link not in products_seen:
                        products_seen[product_link] = processed
                        all_products.append(processed)
                        products_found_on_page = True
                    elif should_update_product(products_seen[product_link], processed):
                        # Update with better data
                        update_product_in_list(all_products, products_seen[product_link], processed)
                        products_seen[product_link] = processed
                        products_found_on_page = True
            
            if products_found_on_page:
                consecutive_empty_pages = 0
                continue  # Skip HTML parsing if we got API data
        
        # Try to extract product data from JSON-LD
        json_ld_products = extract_json_ld_products(soup)
        if json_ld_products:
            logger.info(f"Found {len(json_ld_products)} products from JSON-LD")
            for product in json_ld_products:
                processed = process_product_data(product, category_url)
                if processed:
                    product_link = processed['product_link']
                    if product_link not in products_seen:
                        products_seen[product_link] = processed
                        all_products.append(processed)
                        products_found_on_page = True
                    elif should_update_product(products_seen[product_link], processed):
                        update_product_in_list(all_products, products_seen[product_link], processed)
                        products_seen[product_link] = processed
                        products_found_on_page = True
            
            if products_found_on_page:
                consecutive_empty_pages = 0
                continue  # Skip HTML parsing if we got JSON-LD data
        
        # Fallback to HTML parsing
        logger.info("Trying HTML parsing...")
        
        # Try different selector patterns to find product elements
        selector_patterns = [
            'a[href*="/product/"]',
            'div[data-comp="ProductGrid"] a[href*="/product/"]',
            'div[data-comp="Product"] a',
            '.css-12egk0t a',
            'li[data-comp="ProductItem"] a',
            # Additional selectors for deeper searching
            '[data-at="product_grid"] a',
            '[data-comp="ProductGrid"] [data-at="sku_item"] a',
            # More generic selectors for backup
            'a[href*="skuId="]',
            'a[href*="icid2=products"]'
        ]
        
        product_elements = []
        
        for selector in selector_patterns:
            product_elements = soup.select(selector)
            if product_elements:
                logger.info(f"Found {len(product_elements)} product elements using selector: {selector}")
                break
        
        if not product_elements:
            logger.warning(f"No product elements found on page {page}")
            
            # Try to handle pages with no products directly but with content
            if page >= 5:
                # Check if this is a pagination trap or end of products
                # Look for "no results" indicators
                no_results_indicators = [
                    soup.select('.css-no-results'),
                    soup.select('.no-results'),
                    soup.select('[data-at="no_search_results"]'),
                    soup.find_all(string=re.compile(r'no results', re.IGNORECASE)),
                    soup.find_all(string=re.compile(r'no products', re.IGNORECASE))
                ]
                
                if any(no_results_indicators):
                    logger.warning("Detected 'no results' indicator on page. Stopping pagination.")
                    break
                
                # Try direct product extraction from page by looking for product patterns
                logger.info("Attempting direct extraction of product references from page...")
                
                # Look for product links in href attributes
                product_links = set()
                for link in soup.find_all('a', href=True):
                    href = link.get('href', '')
                    if '/product/' in href and 'P' in href:
                        product_links.add(href)
                
                if product_links:
                    logger.info(f"Found {len(product_links)} product links through direct extraction")
                    
                    for link in product_links:
                        product_data = {
                            'url': link,
                            'brand': '',  # We'll need to fetch the product page to get these details
                            'name': extract_name_from_url(link),
                            'price': '',
                            'rating': '',
                            'image': ''
                        }
                        
                        processed_product = process_product_data(product_data, category_url)
                        if processed_product and processed_product['product_link'] not in products_seen:
                            products_seen[processed_product['product_link']] = processed_product
                            all_products.append(processed_product)
                            products_found_on_page = True
            
            consecutive_empty_pages += 1
            if consecutive_empty_pages >= 2:
                logger.warning(f"Multiple consecutive pages with no products. Stopping pagination at page {page}.")
                break
            
            continue
        
        valid_products = []
        for idx, product_el in enumerate(product_elements):
            try:
                # Save this element's HTML for debugging
                element_file = save_element_debug(product_el, idx)
                
                # Extract data from the element
                product_data = extract_product_data(product_el)
                if not product_data or not product_data.get('url'):
                    logger.warning(f"Element {idx} has no valid product data")
                    continue
                
                # Process the product data
                processed_product = process_product_data(product_data, category_url)
                if processed_product:
                    product_link = processed_product['product_link']
                    if product_link not in products_seen:
                        products_seen[product_link] = processed_product
                        valid_products.append(processed_product)
                        products_found_on_page = True
                    elif should_update_product(products_seen[product_link], processed_product):
                        # Update existing with better data if current data is more complete
                        products_seen[product_link] = processed_product
                        # Need to update the entry in all_products too
                        for i, p in enumerate(all_products):
                            if p['product_link'] == product_link:
                                all_products[i] = processed_product
                                break
                        products_found_on_page = True
            except Exception as e:
                logger.error(f"Error processing product element {idx}: {e}")
        
        logger.info(f"Found {len(valid_products)} valid products from HTML on page {page}")
        all_products.extend(valid_products)
        
        if products_found_on_page:
            consecutive_empty_pages = 0
        else:
            consecutive_empty_pages += 1
            if consecutive_empty_pages >= 2:
                logger.warning(f"Multiple consecutive pages with no products. Stopping pagination at page {page}.")
                break
        
        # Add delay between pages with jitter
        if page < max_pages:
            delay = random.uniform(4, 8)
            logger.info(f"Waiting {delay:.2f} seconds before next page...")
            time.sleep(delay)
    
    # Final deduplication and quality check
    final_products = []
    seen_urls = set()
    
    for product in all_products:
        url = product['product_link']
        if url not in seen_urls and is_valid_product(product):
            seen_urls.add(url)
            final_products.append(product)
    
    logger.info(f"Found {len(final_products)} unique products after final filtering")
    return final_products

def extract_json_ld_products(soup):
    """Extract product data from JSON-LD scripts in the page"""
    products = []
    script_tags = soup.find_all('script', type='application/ld+json')
    
    for script in script_tags:
        try:
            json_data = json.loads(script.string)
            logger.info(f"Found JSON-LD data: {json_data.get('@type', 'unknown type')}")
            
            # Save the JSON-LD data for debugging
            save_debug_json(json_data, f"json_ld_data_{hash(script.string)}")
            
            # Handle different JSON-LD structures
            if isinstance(json_data, list):
                for item in json_data:
                    if isinstance(item, dict) and item.get('@type') == 'Product':
                        products.append(process_json_ld_product(item))
            elif isinstance(json_data, dict):
                if json_data.get('@type') == 'Product':
                    products.append(process_json_ld_product(json_data))
                elif json_data.get('@type') == 'ItemList' and 'itemListElement' in json_data:
                    for item in json_data['itemListElement']:
                        if isinstance(item, dict):
                            # Check if it's directly a product
                            if item.get('@type') == 'Product':
                                products.append(process_json_ld_product(item))
                            # Check if it has an embedded product
                            elif item.get('item', {}).get('@type') == 'Product':
                                products.append(process_json_ld_product(item['item']))
                            # More aggressive extraction for non-standard structures
                            elif isinstance(item.get('item'), dict):
                                potential_product = item.get('item')
                                if 'name' in potential_product and ('image' in potential_product or 'url' in potential_product):
                                    logger.info("Found potential product in non-standard JSON-LD structure")
                                    products.append(process_json_ld_product(potential_product))
        except Exception as e:
            logger.error(f"Error parsing JSON-LD: {e}")
    
    return products

def process_json_ld_product(product):
    """Process a JSON-LD product object into a standardized format"""
    try:
        return {
            'url': product.get('url', ''),
            'brand': product.get('brand', {}).get('name', '') if isinstance(product.get('brand'), dict) else product.get('brand', ''),
            'name': product.get('name', ''),
            'price': str(product.get('offers', {}).get('price', '0')) if isinstance(product.get('offers'), dict) else '0',
            'rating': str(product.get('aggregateRating', {}).get('ratingValue', '0')) if isinstance(product.get('aggregateRating'), dict) else '0',
            'image': product.get('image', '')
        }
    except Exception as e:
        logger.error(f"Error processing JSON-LD product: {e}")
        return None

def should_update_product(existing, new_product):
    """Determine if we should update an existing product with new data"""
    # If new product has more non-empty fields
    existing_filled = sum(1 for v in existing.values() if v)
    new_filled = sum(1 for v in new_product.values() if v)
    
    # If new product has more information, update
    if new_filled > existing_filled:
        return True
    
    # If new product has brand or name when existing doesn't
    if (not existing.get('brand') and new_product.get('brand')) or \
       (not existing.get('product_name') and new_product.get('product_name')):
        return True
    
    return False

def update_product_in_list(product_list, old_product, new_product):
    """Update a product in the list with new data"""
    for i, product in enumerate(product_list):
        if product['product_link'] == old_product['product_link']:
            product_list[i] = new_product
            return True
    return False

def is_valid_product(product):
    """Check if a product has enough valid data to be considered useful"""
    # Must have a valid URL
    if not product.get('product_link'):
        return False
    
    # Should have at least one of brand or product name
    if not product.get('brand') and not product.get('product_name'):
        return False
    
    # Price should be reasonable if provided
    price = product.get('price', 0)
    if price and (price <= 0 or price > 300):
        return False
    
    return True

def process_product_data(product, category_url):
    """Process and clean product data"""
    # Debug the raw product data
    logger.info(f"Processing product: {product}")
    
    # Get URL - the most critical piece of data
    url = product.get('url', '')
    if not url:
        logger.warning("Skipping product with no URL")
        return None
    
    # Create full URL if it's relative
    if url.startswith('/'):
        url = f"https://www.sephora.com{url}"
    
    # Extract product type from the category URL
    product_type = extract_product_type(category_url)
    
    # Extract price as a number
    price = 0
    price_str = product.get('price', '')
    if price_str:
        # Try to handle price as both string and number
        if isinstance(price_str, (int, float)):
            price = float(price_str)
        else:
            price_matches = re.findall(r'\$?(\d+(?:\.\d+)?)', price_str)
            if price_matches:
                try:
                    price = float(price_matches[0])
                except:
                    logger.warning(f"Could not convert price '{price_str}' to float")
    
    # Extract rating as a number
    rating = 0
    rating_str = product.get('rating', '')
    if rating_str:
        # Try to handle rating as both string and number
        if isinstance(rating_str, (int, float)):
            rating = float(rating_str)
        else:
            rating_matches = re.findall(r'(\d+(?:\.\d+)?)', rating_str)
            if rating_matches:
                try:
                    rating = float(rating_matches[0])
                except:
                    logger.warning(f"Could not convert rating '{rating_str}' to float")
    
    # Get or derive a product name
    product_name = product.get('name', '')
    if not product_name:
        # Try to extract product name from URL
        product_name = extract_name_from_url(url)
        logger.info(f"Extracted name from URL: {product_name}")
    
    # Make sure image URL is complete
    image_url = product.get('image', '')
    if image_url and not image_url.startswith('http'):
        image_url = f"https://www.sephora.com{image_url}"
    
    # Construct the final processed product
    processed_product = {
        'product_link': url,
        'brand': product.get('brand', ''),
        'product_name': product_name,
        'product_type': product_type,
        'product_image': image_url,
        'price': price,
        'rating': rating
    }
    
    # Log the processed product
    logger.info(f"Processed product: {processed_product}")
    
    return processed_product

def extract_name_from_url(url):
    """Extract a product name from a URL"""
    if '/product/' in url:
        try:
            # Extract product slug (last part of URL)
            product_slug = url.split('/')[-1]
            
            # Remove query parameters if present
            if '?' in product_slug:
                product_slug = product_slug.split('?')[0]
            
            # Remove the product ID (usually something like "-P12345")
            if '-P' in product_slug:
                name_part = product_slug.split('-P')[0]
            else:
                name_part = product_slug
            
            # Convert something like "some-product-name" to "Some Product Name"
            product_name = ' '.join(word.capitalize() for word in name_part.split('-'))
            return product_name
        except Exception as e:
            logger.error(f"Error extracting name from URL {url}: {e}")
    
    return "Sephora Product"  # Default fallback name

def extract_product_type(category_url):
    """Extract product type from category URL"""
    url_parts = category_url.split('/')
    if len(url_parts) > 0:
        last_part = url_parts[-1]
        # Handle query parameters
        if '?' in last_part:
            last_part = last_part.split('?')[0]
        # Convert hyphenated names to title case
        return ' '.join(word.capitalize() for word in last_part.split('-'))
    return "Makeup"

def store_products(products):
    """Store products in Supabase database with better error handling"""
    if not products:
        logger.warning("No products to store")
        return 0, 0
        
    successful = 0
    failed = 0
    
    logger.info(f"Storing {len(products)} products in database")
    
    # Group products for batch insertion
    batch_size = 10
    product_batches = [products[i:i+batch_size] for i in range(0, len(products), batch_size)]
    
    for batch_idx, batch in enumerate(product_batches):
        logger.info(f"Processing batch {batch_idx+1}/{len(product_batches)}")
        batch_data = []
        
        for product in batch:
            data = {
                'brand': product.get('brand', ''),
                'name': product.get('product_name', ''),
                'link': product.get('product_link', ''),
                'type': product.get('product_type', 'Blush'),
                'image': product.get('product_image', ''),
                'price': product.get('price', 0),
                'rating': product.get('rating', 0)
            }
            batch_data.append(data)
        
        try:
            # Use upsert to handle duplicate links
            response = (
                supabase.table("sephoraproducts")
                .upsert(batch_data, on_conflict="link")
                .execute()
            )
            successful += len(batch_data)
            logger.info(f"Successfully stored batch {batch_idx+1}")
        except Exception as e:
            logger.error(f"Error storing batch {batch_idx+1}: {e}")
            # Try inserting one by one to identify problematic products
            for product_data in batch_data:
                try:
                    supabase.table("sephoraproducts").upsert(product_data, on_conflict="link").execute()
                    successful += 1
                except Exception as product_e:
                    logger.error(f"Error storing product {product_data.get('name', 'unknown')}: {product_e}")
                    failed += 1
        
        # Add delay between batches to avoid overloading the database
        if batch_idx < len(product_batches) - 1:
            time.sleep(1)
    
    return successful, failed

def main():
    # Verify the table exists
    ensure_table_exists()
    
    # Define the category URL for blush products
    # Use the base URL for pagination handling
    category_url = "https://www.sephora.com/shop/blush"
    
    # Alternatively, you can specify a specific starting page
    # starting_url = "https://www.sephora.com/shop/blush?currentPage=3"
    
    # Number of pages to crawl (adjust as needed)
    max_pages = 15  # Increased to capture more blush products
    
    # Starting page (default is 1)
    start_page = 3  # Starting from page 3 as specified
    
    # Create debug directory if it doesn't exist
    os.makedirs("debug_output", exist_ok=True)
    
    logger.info(f"Starting to crawl: {category_url} from page {start_page}")
    
    # Modified to use a custom function for starting from a specific page
    products = crawl_from_specific_page(category_url, start_page=start_page, max_pages=max_pages)
    
    if products:
        logger.info(f"\nFound {len(products)} blush products")
        successful, failed = store_products(products)
        
        logger.info(f"\nScraping complete!")
        logger.info(f"Successfully stored: {successful}")
        logger.info(f"Failed to store: {failed}")
    else:
        logger.warning("No blush products found")

def crawl_from_specific_page(category_url, start_page=1, max_pages=15):
    """Crawl starting from a specific page number"""
    all_products = []
    products_seen = {}  # Keep track of URLs we've already seen, with their data
    
    # Find a working pagination pattern first
    pagination_pattern = determine_working_pagination_pattern(category_url)
    
    # Track consecutive empty pages to detect end of products
    consecutive_empty_pages = 0
    
    # Adjust the range to start from the specified page
    for page in range(start_page, start_page + max_pages):
        page_url = pagination_pattern(page)
        logger.info(f"Crawling page {page}: {page_url}")
        
        # Rest of the crawling logic from crawl_category_page
        # Get the page with retry logic
        response = get_page_with_retry(page_url)
        if not response:
            logger.error(f"Failed to fetch page {page} after multiple retries")
            consecutive_empty_pages += 1
            if consecutive_empty_pages >= 2:
                logger.warning(f"Multiple consecutive failures. Stopping pagination at page {page}.")
                break
            continue
        
        # Parse the HTML content
        html_content = response.text
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Save HTML for debugging
        debug_file = save_debug_html(html_content, page)
        logger.info(f"Saved HTML to {debug_file} for further inspection")
        
        # Initialize a flag to track if any products were found on this page
        products_found_on_page = False
        
        # Try to extract data from API embedded in page (priority)
        api_products = extract_api_data(html_content)
        if api_products:
            logger.info(f"Found {len(api_products)} products from embedded API data")
            for product in api_products:
                processed = process_product_data(product, category_url)
                if processed:
                    product_link = processed['product_link']
                    if product_link not in products_seen:
                        products_seen[product_link] = processed
                        all_products.append(processed)
                        products_found_on_page = True
                    elif should_update_product(products_seen[product_link], processed):
                        # Update with better data
                        update_product_in_list(all_products, products_seen[product_link], processed)
                        products_seen[product_link] = processed
                        products_found_on_page = True
            
            if products_found_on_page:
                consecutive_empty_pages = 0
                continue  # Skip HTML parsing if we got API data
        
        # Try to extract product data from JSON-LD
        json_ld_products = extract_json_ld_products(soup)
        if json_ld_products:
            logger.info(f"Found {len(json_ld_products)} products from JSON-LD")
            for product in json_ld_products:
                processed = process_product_data(product, category_url)
                if processed:
                    product_link = processed['product_link']
                    if product_link not in products_seen:
                        products_seen[product_link] = processed
                        all_products.append(processed)
                        products_found_on_page = True
                    elif should_update_product(products_seen[product_link], processed):
                        update_product_in_list(all_products, products_seen[product_link], processed)
                        products_seen[product_link] = processed
                        products_found_on_page = True
            
            if products_found_on_page:
                consecutive_empty_pages = 0
                continue  # Skip HTML parsing if we got JSON-LD data
        
        # Fallback to HTML parsing
        logger.info("Trying HTML parsing...")
        
        # Try different selector patterns to find product elements
        selector_patterns = [
            'a[href*="/product/"]',
            'div[data-comp="ProductGrid"] a[href*="/product/"]',
            'div[data-comp="Product"] a',
            '.css-12egk0t a',
            'li[data-comp="ProductItem"] a',
            # Additional selectors for deeper searching
            '[data-at="product_grid"] a',
            '[data-comp="ProductGrid"] [data-at="sku_item"] a',
            # More generic selectors for backup
            'a[href*="skuId="]',
            'a[href*="icid2=products"]'
        ]
        
        product_elements = []
        
        for selector in selector_patterns:
            product_elements = soup.select(selector)
            if product_elements:
                logger.info(f"Found {len(product_elements)} product elements using selector: {selector}")
                break
        
        if not product_elements:
            logger.warning(f"No product elements found on page {page}")
            
            # Try to handle pages with no products directly but with content
            if page >= 5:
                # Check if this is a pagination trap or end of products
                # Look for "no results" indicators
                no_results_indicators = [
                    soup.select('.css-no-results'),
                    soup.select('.no-results'),
                    soup.select('[data-at="no_search_results"]'),
                    soup.find_all(string=re.compile(r'no results', re.IGNORECASE)),
                    soup.find_all(string=re.compile(r'no products', re.IGNORECASE))
                ]
                
                if any(no_results_indicators):
                    logger.warning("Detected 'no results' indicator on page. Stopping pagination.")
                    break
                
                # Try direct product extraction from page by looking for product patterns
                logger.info("Attempting direct extraction of product references from page...")
                
                # Look for product links in href attributes
                product_links = set()
                for link in soup.find_all('a', href=True):
                    href = link.get('href', '')
                    if '/product/' in href and 'P' in href:
                        product_links.add(href)
                
                if product_links:
                    logger.info(f"Found {len(product_links)} product links through direct extraction")
                    
                    for link in product_links:
                        product_data = {
                            'url': link,
                            'brand': '',  # We'll need to fetch the product page to get these details
                            'name': extract_name_from_url(link),
                            'price': '',
                            'rating': '',
                            'image': ''
                        }
                        
                        processed_product = process_product_data(product_data, category_url)
                        if processed_product and processed_product['product_link'] not in products_seen:
                            products_seen[processed_product['product_link']] = processed_product
                            all_products.append(processed_product)
                            products_found_on_page = True
            
            consecutive_empty_pages += 1
            if consecutive_empty_pages >= 2:
                logger.warning(f"Multiple consecutive pages with no products. Stopping pagination at page {page}.")
                break
            
            continue
        
        valid_products = []
        for idx, product_el in enumerate(product_elements):
            try:
                # Save this element's HTML for debugging
                element_file = save_element_debug(product_el, idx)
                
                # Extract data from the element
                product_data = extract_product_data(product_el)
                if not product_data or not product_data.get('url'):
                    logger.warning(f"Element {idx} has no valid product data")
                    continue
                
                # Process the product data
                processed_product = process_product_data(product_data, category_url)
                if processed_product:
                    product_link = processed_product['product_link']
                    if product_link not in products_seen:
                        products_seen[product_link] = processed_product
                        valid_products.append(processed_product)
                        products_found_on_page = True
                    elif should_update_product(products_seen[product_link], processed_product):
                        # Update existing with better data if current data is more complete
                        products_seen[product_link] = processed_product
                        # Need to update the entry in all_products too
                        for i, p in enumerate(all_products):
                            if p['product_link'] == product_link:
                                all_products[i] = processed_product
                                break
                        products_found_on_page = True
            except Exception as e:
                logger.error(f"Error processing product element {idx}: {e}")
        
        logger.info(f"Found {len(valid_products)} valid products from HTML on page {page}")
        all_products.extend(valid_products)
        
        if products_found_on_page:
            consecutive_empty_pages = 0
        else:
            consecutive_empty_pages += 1
            if consecutive_empty_pages >= 2:
                logger.warning(f"Multiple consecutive pages with no products. Stopping pagination at page {page}.")
                break
        
        # Add delay between pages with jitter
        if page < start_page + max_pages - 1:
            delay = random.uniform(4, 8)
            logger.info(f"Waiting {delay:.2f} seconds before next page...")
            time.sleep(delay)
    
    # Final deduplication and quality check
    final_products = []
    seen_urls = set()
    
    for product in all_products:
        url = product['product_link']
        if url not in seen_urls and is_valid_product(product):
            seen_urls.add(url)
            final_products.append(product)
    
    logger.info(f"Found {len(final_products)} unique products after final filtering")
    return final_products

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("Script interrupted by user. Exiting gracefully...")
    except Exception as e:
        logger.error(f"Unhandled exception: {e}", exc_info=True)