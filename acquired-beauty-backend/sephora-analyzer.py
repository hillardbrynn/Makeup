import os
from dotenv import load_dotenv
from supabase import create_client, Client
import pandas as pd
import matplotlib.pyplot as plt
from collections import Counter
import argparse

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("SUPABASE_URL or SUPABASE_KEY is missing from environment variables")

supabase = create_client(supabase_url, supabase_key)

def get_product_count():
    """Get the total count of products in the database"""
    try:
        response = supabase.table("sephoraproducts").select("*", count="exact").execute()
        return response.count
    except Exception as e:
        print(f"Error getting product count: {e}")
        return None

def get_products_by_brand(limit=20):
    """Get counts of products by brand"""
    try:
        response = supabase.table("sephoraproducts").select("brand").execute()
        brands = [item['brand'] for item in response.data if item.get('brand')]
        brand_counts = Counter(brands)
        return brand_counts.most_common(limit)
    except Exception as e:
        print(f"Error getting brands: {e}")
        return []

def get_price_distribution():
    """Get price distribution information"""
    try:
        response = supabase.table("sephoraproducts").select("price").execute()
        prices = [item['price'] for item in response.data if item.get('price')]
        
        if not prices:
            return None
            
        return {
            'min': min(prices),
            'max': max(prices),
            'avg': sum(prices) / len(prices),
            'median': sorted(prices)[len(prices) // 2],
            'count': len(prices)
        }
    except Exception as e:
        print(f"Error getting price distribution: {e}")
        return None

def get_product_types():
    """Get counts of different product types"""
    try:
        response = supabase.table("sephoraproducts").select("type").execute()
        types = [item['type'] for item in response.data if item.get('type')]
        type_counts = Counter(types)
        return type_counts.most_common(20)
    except Exception as e:
        print(f"Error getting product types: {e}")
        return []

def export_to_csv(filename="sephora_products.csv"):
    """Export all products to a CSV file"""
    try:
        response = supabase.table("sephoraproducts").select("*").execute()
        if not response.data:
            print("No data to export")
            return False
            
        df = pd.DataFrame(response.data)
        df.to_csv(filename, index=False)
        print(f"Exported {len(df)} products to {filename}")
        return True
    except Exception as e:
        print(f"Error exporting to CSV: {e}")
        return False

def visualize_data():
    """Create basic visualizations of the data"""
    try:
        # Get brand data
        brands = get_products_by_brand(10)
        if brands:
            brand_names = [b[0] for b in brands]
            brand_counts = [b[1] for b in brands]
            
            plt.figure(figsize=(12, 6))
            plt.bar(brand_names, brand_counts)
            plt.title('Top 10 Brands by Product Count')
            plt.xlabel('Brand')
            plt.ylabel('Number of Products')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig('top_brands.png')
            print("Created top_brands.png visualization")
        
        # Get price data
        response = supabase.table("sephoraproducts").select("price").execute()
        prices = [item['price'] for item in response.data if item.get('price')]
        
        if prices:
            plt.figure(figsize=(10, 6))
            plt.hist(prices, bins=20)
            plt.title('Distribution of Product Prices')
            plt.xlabel('Price ($)')
            plt.ylabel('Number of Products')
            plt.savefig('price_distribution.png')
            print("Created price_distribution.png visualization")
            
        # Get product type data
        types = get_product_types()
        if types and len(types) > 5:
            type_names = [t[0] for t in types[:10]]
            type_counts = [t[1] for t in types[:10]]
            
            plt.figure(figsize=(12, 6))
            plt.bar(type_names, type_counts)
            plt.title('Top Product Types')
            plt.xlabel('Product Type')
            plt.ylabel('Number of Products')
            plt.xticks(rotation=45, ha='right')
            plt.tight_layout()
            plt.savefig('product_types.png')
            print("Created product_types.png visualization")
            
        return True
    except Exception as e:
        print(f"Error creating visualizations: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Analyze Sephora product data')
    parser.add_argument('--count', action='store_true', help='Get total product count')
    parser.add_argument('--brands', action='store_true', help='Get top brands')
    parser.add_argument('--prices', action='store_true', help='Get price distribution')
    parser.add_argument('--types', action='store_true', help='Get product types')
    parser.add_argument('--export', action='store_true', help='Export data to CSV')
    parser.add_argument('--visualize', action='store_true', help='Create visualizations')
    parser.add_argument('--all', action='store_true', help='Run all analyses')
    
    args = parser.parse_args()
    
    # If no arguments provided, show help
    if not any(vars(args).values()):
        parser.print_help()
        return
    
    # Run selected analyses
    if args.count or args.all:
        count = get_product_count()
        print(f"Total products in database: {count}")
        
    if args.brands or args.all:
        brands = get_products_by_brand()
        print("\nTop brands by product count:")
        for brand, count in brands:
            print(f"  {brand}: {count} products")
            
    if args.prices or args.all:
        prices = get_price_distribution()
        if prices:
            print("\nPrice distribution:")
            print(f"  Range: ${prices['min']} - ${prices['max']}")
            print(f"  Average: ${prices['avg']:.2f}")
            print(f"  Median: ${prices['median']}")
    
    if args.types or args.all:
        types = get_product_types()
        print("\nProduct types:")
        for type_name, count in types:
            print(f"  {type_name}: {count} products")
    
    if args.export or args.all:
        export_to_csv()
        
    if args.visualize or args.all:
        visualize_data()

if __name__ == "__main__":
    main()