import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import HTTPException

# Load environment variables from the parent .env file
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(dotenv_path)

# Get Supabase credentials from environment variables
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"Supabase URL: {supabase_url}")
print(f"Supabase Key exists: {'Yes' if supabase_key else 'No'}")

if not supabase_url or not supabase_key:
    print("Supabase credentials not found in environment variables!")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Env file path being checked: {dotenv_path}")
    print(f"Env file exists: {os.path.exists(dotenv_path)}")
    
    # Use hardcoded values as fallback (same as in .env)
    supabase_url = "https://btyhalqffkgjvsvkentn.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0eWhhbHFmZmtnanZzdmtlbnRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDIwNDY1NCwiZXhwIjoyMDY5NzgwNjU0fQ.j-IgpKgHHMF0rK7_sOSWOyHv43TzPZTyQOCp4xR6CC0"
    print("Using hardcoded fallback values instead")

# Initialize Supabase client
try:
    supabase: Client = create_client(supabase_url, supabase_key)
    print("Supabase client initialized successfully")
except Exception as e:
    print(f"Error initializing Supabase client: {e}")
    # We don't want to raise an exception here as it would prevent the app from starting
    # Instead, we'll handle the error when the client is used

def test_connection():
    """Test the Supabase connection and return the result."""
    try:
        # Simple query to check connectivity
        response = supabase.table('_schema').select('version').limit(1).execute()
        return {
            "success": True,
            "message": "Successfully connected to Supabase",
            "data": response.data
        }
    except Exception as e:
        print(f"Supabase connection test failed: {e}")
        return {
            "success": False,
            "message": f"Failed to connect to Supabase: {str(e)}",
            "error": str(e)
        }

def get_user_by_id(user_id: str):
    """
    Get a user from the profiles table by ID.
    
    Args:
        user_id: The user's UUID
        
    Returns:
        User data or None if not found
    """
    try:
        response = supabase.table('profiles').select('*').eq('id', user_id).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
    except Exception as e:
        print(f"Error fetching user: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
