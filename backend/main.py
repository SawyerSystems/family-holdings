try:
    from fastapi import FastAPI, Depends, HTTPException
    import uvicorn
    from fastapi.middleware.cors import CORSMiddleware
    from pydantic import BaseModel
except ImportError as e:
    print(f"Error importing required packages: {e}")
    print("Please ensure you've activated the virtual environment with 'source venv/bin/activate'")
    print("And installed the requirements with 'pip install -r requirements.txt'")
    exit(1)

# Import our Supabase client
try:
    import supabase_client
except ImportError as e:
    print(f"Error importing supabase_client: {e}")
    print("Make sure you have installed the supabase Python package with 'pip install supabase'")
    exit(1)

app = FastAPI(title="Family Holdings Backend API")

# Configure CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5273"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Family Holdings API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/api/database/test-connection")
async def test_db_connection():
    """Test the Supabase database connection."""
    result = supabase_client.test_connection()
    if not result["success"]:
        return {"status": "error", "message": result["message"]}
    return {"status": "ok", "message": result["message"], "data": result.get("data")}

from routers import users as users_router
from routers import contributions as contributions_router
from routers import stats as stats_router

app.include_router(users_router.router)
app.include_router(contributions_router.router)
app.include_router(stats_router.router)

# Placeholder: loans & stats routers to follow

if __name__ == "__main__":
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
