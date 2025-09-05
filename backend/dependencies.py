from fastapi import Header, HTTPException, Depends
import os
import re

MOCK_MODE = os.getenv("UVICORN_MOCK_AUTH") == "1"

def is_valid_uuid(uuid_string):
    """Check if a string is a valid UUID format"""
    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        re.IGNORECASE
    )
    return bool(uuid_pattern.match(uuid_string or ''))

class UserContext:
    def __init__(self, id: str, role: str, email: str | None = None):
        self.id = id
        self.role = role
        self.email = email or "mock@example.com"

def get_current_user(x_user_id: str | None = Header(default=None), x_user_role: str | None = Header(default=None)) -> UserContext:
    """Phase 1 mock auth or header-injected context."""
    if MOCK_MODE:
        # Default admin for rapid development (using real UUID from sample data)
        user_id = x_user_id or "5e98e9eb-375b-49f6-82bc-904df30c4021"
        
        # Validate UUID format, fallback to default if invalid
        if not is_valid_uuid(user_id):
            print(f"Warning: Invalid UUID format received: {user_id}, falling back to default admin")
            user_id = "5e98e9eb-375b-49f6-82bc-904df30c4021"
            
        return UserContext(id=user_id, role=x_user_role or "admin")
    # Future: validate JWT here
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    # Validate UUID format in production mode
    if not is_valid_uuid(x_user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")
        
    return UserContext(id=x_user_id, role=x_user_role or "member")

def require_admin(user: UserContext = Depends(get_current_user)) -> UserContext:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user
