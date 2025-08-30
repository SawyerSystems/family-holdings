from fastapi import Header, HTTPException, Depends
import os

MOCK_MODE = os.getenv("UVICORN_MOCK_AUTH") == "1"

class UserContext:
    def __init__(self, id: str, role: str, email: str | None = None):
        self.id = id
        self.role = role
        self.email = email or "mock@example.com"

def get_current_user(x_user_id: str | None = Header(default=None), x_user_role: str | None = Header(default=None)) -> UserContext:
    """Phase 1 mock auth or header-injected context."""
    if MOCK_MODE:
        # Default admin for rapid development
        return UserContext(id=x_user_id or "dev-admin", role=x_user_role or "admin")
    # Future: validate JWT here
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return UserContext(id=x_user_id, role=x_user_role or "member")

def require_admin(user: UserContext = Depends(get_current_user)) -> UserContext:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user
