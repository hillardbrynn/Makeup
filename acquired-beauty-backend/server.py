from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
import numpy as np
import os
from dotenv import load_dotenv
import json
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
    user_id: Optional[str] = None
    skin_tone: str = Field(default="")
    under_tone: str = Field(default="")  # Changed from undertone to under_tone
    coverage_level: str = Field(default="")  # Changed from coverage to coverage_level
    skin_type: str = Field(default="")
    restrictions: str = Field(default="")  # Changed from skin_concerns to restrictions
    lip_product: str = Field(default="")
    eye_color: str = Field(default="")
    makeup_style: str = Field(default="")
    makeup_frequency: str = Field(default="")
    
    class Config:
        extra = "ignore"  # Ignore extra fields

@app.post("/store-results")
async def store_results(quiz_result: QuizResult):
    try:
        print("Request data:", quiz_result.model_dump())  # Use model_dump instead of dict
        
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
        
        # Prepare quiz data (without embedding)
        quiz_data = {
            "skin_tone": quiz_result.skin_tone,
            "under_tone": quiz_result.under_tone,
            "coverage_level": quiz_result.coverage_level,
            "skin_type": quiz_result.skin_type,
            "restrictions": quiz_result.restrictions,
            "lip_product": quiz_result.lip_product,
            "eye_color": quiz_result.eye_color,
            "makeup_style": quiz_result.makeup_style,
            "makeup_frequency": quiz_result.makeup_frequency
        }
        
        # Add user_id if provided
        if quiz_result.user_id:
            quiz_data["user_id"] = quiz_result.user_id
            
        print("Quiz data prepared:", quiz_data)
        
        # Step 1: Insert into quiz table
        print("1. Inserting into quiz table...")
        try:
            quiz_response = supabase.table("quiz").insert(quiz_data).execute()
            print("   Quiz data inserted successfully")
            
            # Get the ID of the newly inserted quiz record
            quiz_id = None
            if hasattr(quiz_response, 'data') and quiz_response.data:
                quiz_id = quiz_response.data[0].get('id')
                
            print(f"   New quiz ID: {quiz_id}")
            
            # Step 2: Only proceed with embedding if we have a quiz ID
            if quiz_id:
                print("2. Generating embedding...")
                try:
                    # Generate TF-IDF embedding
                    vectorizer = TfidfVectorizer()
                    vector = vectorizer.fit_transform([text_representation])
                    
                    # Convert sparse matrix to dense array and then to list
                    embedding = vector.toarray()[0].tolist()
                    print(f"   Vectorization successful, embedding length: {len(embedding)}")
                    
                    # Step 3: Insert embedding into quiz_embedding table
                    print("3. Inserting embedding into quiz_embedding table...")
                    embedding_data = {
                        "quiz_id": quiz_id,
                        "embedding": embedding
                    }
                    
                    embedding_response = supabase.table("quiz_embedding").insert(embedding_data).execute()
                    print("   Embedding inserted successfully")
                    
                except Exception as e:
                    print(f"   Error generating or storing embedding: {str(e)}")
                    # Don't fail the whole request if embedding fails
                    print("   Continuing without embedding")
            else:
                print("   No quiz ID returned, skipping embedding")
                
        except Exception as e:
            error_msg = str(e)
            print(f"Database insert error: {error_msg}")
            raise HTTPException(status_code=500, detail=f"Database insert error: {error_msg}")
                
        return {"status": "success", "message": "Quiz results stored successfully"}
    except Exception as e:
        print(f"Unexpected error in store_results: {str(e)}")
        tb = traceback.format_exc()
        print(f"Stack trace: {tb}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)