try:
    from fastapi import FastAPI
    import uvicorn
    from fastapi.middleware.cors import CORSMiddleware
except ImportError as e:
    print(f"Error importing required packages: {e}")
    print("Please ensure you've activated the virtual environment with 'source venv/bin/activate'")
    print("And installed the requirements with 'pip install -r requirements.txt'")
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

# User endpoints will go here

# Contribution endpoints will go here

# Loan endpoints will go here

# Admin endpoints will go here

if __name__ == "__main__":
    # Run the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
