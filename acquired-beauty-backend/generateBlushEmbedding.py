import os
import requests
import json
from dotenv import load_dotenv
from sklearn.feature_extraction.text import TfidfVectorizer
import time

# Load environment variables
load_dotenv()

# Supabase connection details
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not SUPABASE_URL.endswith('/'):
    SUPABASE_URL = SUPABASE_URL + '/'

# Setup headers for all requests
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def get_all_products():
    """Get all products from the blush table"""
    try:
        url = f"{SUPABASE_URL}rest/v1/blush?select=*"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            products = response.json()
            print(f"Successfully fetched {len(products)} products")
            return products
        else:
            print(f"Error fetching products: {response.status_code}")
            print(f"Response: {response.text}")
            return []
    except Exception as e:
        print(f"Exception while fetching products: {str(e)}")
        return []

def check_table_exists():
    """Check if the blush_embeddings table exists"""
    try:
        url = f"{SUPABASE_URL}rest/v1/blush_embeddings?limit=0"
        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print("Table blush_embeddings exists")
            return True
        else:
            print(f"Table check failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"Exception checking table: {str(e)}")
        return False

def insert_embedding(blush_id, embedding):
    """Insert an embedding into the blush_embeddings table"""
    try:
        # First check if an embedding already exists for this product
        check_url = f"{SUPABASE_URL}rest/v1/blush_embeddings?blush_id=eq.{blush_id}"
        check_response = requests.get(check_url, headers=headers)
        
        # Prepare data for insert/update
        data = {
            "blush_id": blush_id,
            "embedding": embedding
        }
        
        if check_response.status_code == 200 and len(check_response.json()) > 0:
            # Embedding exists, update it
            print(f"Updating embedding for product {blush_id}")
            
            # Add Prefer header for returning the updated record
            update_headers = headers.copy()
            update_headers["Prefer"] = "return=representation"
            
            update_url = f"{SUPABASE_URL}rest/v1/blush_embeddings?blush_id=eq.{blush_id}"
            update_response = requests.patch(update_url, headers=update_headers, json=data)
            
            print(f"Update response code: {update_response.status_code}")
            
            if update_response.status_code in [200, 204]:
                try:
                    print(f"Update response: {update_response.text[:100]}...")
                    return True
                except Exception as e:
                    print(f"Error parsing update response: {str(e)}")
                    return True if update_response.status_code in [200, 204] else False
            else:
                print(f"Update failed: {update_response.status_code}")
                print(f"Response: {update_response.text}")
                return False
        else:
            # No existing embedding, insert a new one
            print(f"Inserting new embedding for product {blush_id}")
            
            # Add Prefer header for returning the inserted record
            insert_headers = headers.copy()
            insert_headers["Prefer"] = "return=representation"
            
            insert_url = f"{SUPABASE_URL}rest/v1/blush_embeddings"
            insert_response = requests.post(insert_url, headers=insert_headers, json=data)
            
            print(f"Insert response code: {insert_response.status_code}")
            
            if insert_response.status_code in [201, 200, 204]:
                try:
                    print(f"Insert response: {insert_response.text[:100]}...")
                    return True
                except Exception as e:
                    print(f"Error parsing insert response: {str(e)}")
                    return True if insert_response.status_code in [201, 200, 204] else False
            else:
                print(f"Insert failed: {insert_response.status_code}")
                print(f"Response: {insert_response.text}")
                return False
    except Exception as e:
        print(f"Exception during embedding insert/update for product {blush_id}: {str(e)}")
        return False

def generate_embeddings():
    """Main function to generate and store embeddings"""
    print(f"Starting embedding generation with Supabase URL: {SUPABASE_URL}")
    
    # Check if the table exists
    if not check_table_exists():
        print("""
        Please run the following SQL in the Supabase SQL Editor:
        
        CREATE EXTENSION IF NOT EXISTS vector;
        
        CREATE TABLE IF NOT EXISTS blush_embeddings (
            id SERIAL PRIMARY KEY,
            blush_id INTEGER NOT NULL REFERENCES blush(id),
            embedding VECTOR(120),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(blush_id)
        );
        """)
        return
    
    # Get all products
    products = get_all_products()
    if not products:
        print("No products found to process")
        return
    
    # Create text representations for vectorization
    product_texts = []
    product_ids = []
    
    for product in products:
        # Extract relevant text fields for embedding
        text_features = []
        for key, value in product.items():
            if value is not None and key not in ['id', 'price', 'rating', 'image', 'link']:
                text_features.append(f"{key}: {value}")
        
        product_text = " ".join(text_features)
        product_texts.append(product_text)
        product_ids.append(product['id'])
        
        print(f"Product {product['id']} - {product.get('name', 'Unnamed')}: {product_text[:100]}...")
    
    # Generate TF-IDF embeddings
    print("Generating embeddings...")
    vectorizer = TfidfVectorizer()
    embeddings = vectorizer.fit_transform(product_texts)
    
    print(f"Generated embeddings with shape: {embeddings.shape}")
    
    # Insert embeddings into database
    success_count = 0
    failure_count = 0
    
    for i, product_id in enumerate(product_ids):
        # Convert sparse vector to regular array and then to list
        embedding = embeddings[i].toarray()[0].tolist()
        
        print(f"Processing product {product_id} with embedding of length {len(embedding)}")
        
        # Insert or update the embedding
        if insert_embedding(product_id, embedding):
            success_count += 1
            print(f"Successfully processed product {product_id}")
        else:
            failure_count += 1
            print(f"Failed to process product {product_id}")
        
        # Add a small delay between requests to avoid rate limiting
        time.sleep(0.5)
    
    print(f"Embedding generation complete. Successes: {success_count}, Failures: {failure_count}")

if __name__ == "__main__":
    generate_embeddings()