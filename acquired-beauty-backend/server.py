from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import os
from dotenv import load_dotenv
import traceback
from supabase import create_client, Client
from sklearn.feature_extraction.text import TfidfVectorizer

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

print(f"Supabase URL: {supabase_url}")
print(f"Supabase Key: {supabase_key[:5]}...{supabase_key[-5:] if supabase_key else None}")

supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizResult(BaseModel):
    skin_tone: str = Field(default="")
    under_tone: str = Field(default="")
    coverage_level: str = Field(default="")
    skin_type: str = Field(default="")
    restrictions: str = Field(default="")
    lip_product: str = Field(default="")
    eye_color: str = Field(default="")
    makeup_style: str = Field(default="")
    makeup_frequency: str = Field(default="")
    
    class Config:
        extra = "ignore"  # Ignore extra fields

@app.post("/generate-embedding")
async def generate_embedding(quiz_result: QuizResult):
    try:
        print("Generating embedding for quiz answers:", quiz_result.model_dump())
        
        # Convert the quiz result to a single text string for vectorization
        text_representation = ' '.join([
            f"skin_tone: {quiz_result.skin_tone}",
            f"under_tone: {quiz_result.under_tone}",
            f"coverage_level: {quiz_result.coverage_level}",
            f"skin_type: {quiz_result.skin_type}",
            f"restrictions: {quiz_result.restrictions}",
            f"lip_product: {quiz_result.lip_product}",
            f"eye_color: {quiz_result.eye_color}",
            f"makeup_style: {quiz_result.makeup_style}",
            f"makeup_frequency: {quiz_result.makeup_frequency}"
        ])
        
        # Generate TF-IDF embedding
        vectorizer = TfidfVectorizer()
        vector = vectorizer.fit_transform([text_representation])
        
        # Convert sparse matrix to dense array and then to list
        embedding = vector.toarray()[0].tolist()
        print(f"Generated embedding with length: {len(embedding)}")
        
        return {
            "status": "success",
            "embedding": embedding
        }
    
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        tb = traceback.format_exc()
        print(f"Stack trace: {tb}")
        raise HTTPException(status_code=500, detail="Failed to generate embedding")

@app.get("/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None):
    try:
        # Fetch products from Supabase
        query = supabase.table("products").select("*")
        
        # Apply category filter if provided
        if category and category != 'all':
            query = query.eq('category', category)
        
        # Apply search filter if provided
        if search:
            query = query.ilike('name', f'%{search}%')
        
        response = query.execute()
        
        if hasattr(response, 'data'):
            return {"products": response.data}
        else:
            return {"products": []}
    
    except Exception as e:
        print(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch products")

@app.get("/product-embeddings")
async def get_product_embeddings():
    try:
        # Fetch all product embeddings
        response = supabase.table("product_embeddings").select("product_id, embedding").execute()
        
        if hasattr(response, 'data'):
            return {"embeddings": response.data}
        else:
            return {"embeddings": []}
    
    except Exception as e:
        print(f"Error fetching product embeddings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch product embeddings")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)