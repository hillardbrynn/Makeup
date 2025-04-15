from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
import os
import numpy as np
from dotenv import load_dotenv
import traceback
import logging
from supabase import create_client, Client

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

logger.info(f"Supabase URL: {supabase_url}")
logger.info(f"Supabase Key: {supabase_key[:5]}...{supabase_key[-5:] if supabase_key else None}")

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

# Define the vector size for embeddings (should match the product embeddings)
VECTOR_SIZE = 128

# Define mappings matching those in the product embedding script
SKIN_TONE_MAPPING = {
    'fair': [1.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    'light': [0.7, 0.3, 0.0, 0.0, 0.0, 0.0],
    'medium': [0.3, 0.7, 0.3, 0.0, 0.0, 0.0],
    'tan': [0.0, 0.3, 0.7, 0.3, 0.0, 0.0],
    'deep': [0.0, 0.0, 0.3, 0.7, 0.3, 0.0],
    'very-deep': [0.0, 0.0, 0.0, 0.3, 0.7, 1.0],
}

UNDERTONE_MAPPING = {
    'cool': [1.0, 0.0, 0.0],
    'neutral': [0.0, 1.0, 0.0],
    'warm': [0.0, 0.0, 1.0],
}

COVERAGE_MAPPING = {
    'sheer': [1.0, 0.0, 0.0],
    'medium': [0.0, 1.0, 0.0],
    'full': [0.0, 0.0, 1.0],
}

SKIN_TYPE_MAPPING = {
    'oily': [1.0, 0.0, 0.0, 0.0],
    'dry': [0.0, 1.0, 0.0, 0.0],
    'combination': [0.5, 0.5, 0.0, 0.0],
    'normal': [0.0, 0.0, 1.0, 0.0],
}

# Feature weights to emphasize important attributes
FEATURE_WEIGHTS = {
    'skin_tone': 2.0,      # Very important
    'under_tone': 2.0,     # Very important
    'coverage_level': 1.2, # Somewhat important
    'skin_type': 1.2,      # Somewhat important
    'restrictions': 1.0,   # Basic product info
    'lip_product': 0.5,    # Less important for blush matching
    'eye_color': 0.5,      # Less important for blush matching
    'makeup_style': 0.8,   # Somewhat important
    'makeup_frequency': 0.5, # Less important
}

def generate_semantic_embedding(quiz_result: QuizResult) -> List[float]:
    """
    Generate a semantic embedding for user quiz results with the same
    structure as product embeddings for better matching.
    """
    # Initialize a zero vector
    embedding = np.zeros(VECTOR_SIZE)
    
    # Helper function to fill a section of the embedding
    def fill_section(start_idx, values, weight=1.0):
        if values is None:
            return False
        
        length = len(values)
        embedding[start_idx:start_idx+length] = np.array(values) * weight
        return True
    
    # Extract and map skin tone information
    skin_tone_idx = 0
    skin_tone = quiz_result.skin_tone.lower()
    if skin_tone in SKIN_TONE_MAPPING:
        embedding[skin_tone_idx:skin_tone_idx+6] = np.array(SKIN_TONE_MAPPING[skin_tone]) * FEATURE_WEIGHTS.get('skin_tone', 1.0)
        logger.info(f"Set skin tone: {skin_tone}")
    
    # Extract and map undertone information
    undertone_idx = 10
    undertone = quiz_result.under_tone.lower()
    if undertone in UNDERTONE_MAPPING:
        embedding[undertone_idx:undertone_idx+3] = np.array(UNDERTONE_MAPPING[undertone]) * FEATURE_WEIGHTS.get('under_tone', 1.0)
        logger.info(f"Set undertone: {undertone}")
    
    # Extract and map coverage information
    coverage_idx = 20
    coverage = quiz_result.coverage_level.lower()
    if coverage in COVERAGE_MAPPING:
        embedding[coverage_idx:coverage_idx+3] = np.array(COVERAGE_MAPPING[coverage]) * FEATURE_WEIGHTS.get('coverage_level', 1.0)
        logger.info(f"Set coverage level: {coverage}")
    
    # Extract and map skin type information
    skin_type_idx = 30
    skin_type = quiz_result.skin_type.lower()
    if skin_type in SKIN_TYPE_MAPPING:
        embedding[skin_type_idx:skin_type_idx+4] = np.array(SKIN_TYPE_MAPPING[skin_type]) * FEATURE_WEIGHTS.get('skin_type', 1.0)
        logger.info(f"Set skin type: {skin_type}")
    
    # Extract concerns/restrictions
    concerns_idx = 40
    if quiz_result.restrictions:
        concern_vec = np.zeros(6)  # 6 possible concerns in quiz
        concerns = quiz_result.restrictions.split(',')
        
        # Map concerns to vector positions
        concern_mapping = {
            'acne': 0, 'aging': 1, 'dark-spots': 2, 
            'redness': 3, 'pores': 4, 'texture': 5
        }
        
        for concern in concerns:
            concern = concern.strip().lower()
            if concern in concern_mapping:
                concern_vec[concern_mapping[concern]] = 1.0
                logger.info(f"Added concern: {concern}")
        
        embedding[concerns_idx:concerns_idx+6] = concern_vec * FEATURE_WEIGHTS.get('restrictions', 1.0)
    
    # Extract lip product preference
    lip_idx = 50
    lip_mapping = {
        'lipstick': [1.0, 0.0, 0.0, 0.0],
        'gloss': [0.0, 1.0, 0.0, 0.0],
        'stain': [0.0, 0.0, 1.0, 0.0],
        'balm': [0.0, 0.0, 0.0, 1.0]
    }
    lip_product = quiz_result.lip_product.lower()
    if lip_product in lip_mapping:
        embedding[lip_idx:lip_idx+4] = np.array(lip_mapping[lip_product]) * FEATURE_WEIGHTS.get('lip_product', 0.5)
        logger.info(f"Set lip product: {lip_product}")
    
    # Extract makeup style
    style_idx = 60
    style_mapping = {
        'natural': [1.0, 0.0, 0.0, 0.0],
        'minimal': [0.7, 0.3, 0.0, 0.0],
        'glam': [0.0, 0.0, 1.0, 0.0],
        'experimental': [0.0, 0.0, 0.0, 1.0]
    }
    makeup_style = quiz_result.makeup_style.lower()
    if makeup_style in style_mapping:
        embedding[style_idx:style_idx+4] = np.array(style_mapping[makeup_style]) * FEATURE_WEIGHTS.get('makeup_style', 0.8)
        logger.info(f"Set makeup style: {makeup_style}")
    
    # Extract makeup frequency
    freq_idx = 70
    freq_mapping = {
        'daily': [1.0, 0.0, 0.0, 0.0],
        'few-times': [0.0, 1.0, 0.0, 0.0],
        'occasionally': [0.0, 0.0, 1.0, 0.0],
        'rarely': [0.0, 0.0, 0.0, 1.0]
    }
    frequency = quiz_result.makeup_frequency.lower()
    if frequency in freq_mapping:
        embedding[freq_idx:freq_idx+4] = np.array(freq_mapping[frequency]) * FEATURE_WEIGHTS.get('makeup_frequency', 0.5)
        logger.info(f"Set makeup frequency: {frequency}")
    
    # Normalize the embedding
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    
    # Log some stats about the embedding
    num_nonzero = np.count_nonzero(embedding)
    logger.info(f"Generated embedding with {num_nonzero} non-zero values out of {VECTOR_SIZE}")
    logger.info(f"First 10 values: {embedding[:10]}")
    
    return embedding.tolist()

@app.post("/generate-embedding")
async def generate_embedding(quiz_result: Dict):
    try:
        # Convert the dictionary to a QuizResult object
        # This helps handle the parsing and validation of incoming data
        structured_result = QuizResult(**quiz_result)
        
        logger.info(f"Received quiz answers: {structured_result.model_dump()}")
        
        # Generate embedding with the same structure as product embeddings
        embedding = generate_semantic_embedding(structured_result)
        
        # Calculate some stats about the embedding
        nonzero_count = sum(1 for v in embedding if v != 0)
        
        return {
            "status": "success",
            "embedding": embedding,
            "meta": {
                "nonzero_values": nonzero_count,
                "dimension": len(embedding),
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }
        }
    
    except Exception as e:
        logger.error(f"Error generating embedding: {str(e)}")
        tb = traceback.format_exc()
        logger.error(f"Stack trace: {tb}")
        raise HTTPException(status_code=500, detail=f"Failed to generate embedding: {str(e)}")
    
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
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch products")

@app.get("/product-embeddings")
async def get_product_embeddings():
    try:
        # Fetch all product embeddings
        response = supabase.table("blush_embeddings").select("blush_id, embedding").execute()
        
        if hasattr(response, 'data'):
            return {"embeddings": response.data}
        else:
            return {"embeddings": []}
    
    except Exception as e:
        logger.error(f"Error fetching product embeddings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch product embeddings")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)