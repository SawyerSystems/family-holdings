from fastapi import APIRouter, Depends, HTTPException
from ..dependencies import get_current_user, require_admin, UserContext
from .. import supabase_client
from ..models import UserCreate, UserOut, UserUpdate
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def get_me(user: UserContext = Depends(get_current_user)):
    data = supabase_client.supabase.table('profiles').select('*').eq('id', user.id).execute().data
    profile = data[0] if data else {
        'id': user.id,
        'full_name': None,
        'role': user.role,
        'weekly_contribution': None,
        'total_contributed': 0,
        'borrowing_limit': 0,
        'current_loan_balance': 0,
    }
    profile['email'] = user.email
    return profile

@router.get("", dependencies=[Depends(require_admin)])
def list_users():
    res = supabase_client.supabase.table('profiles').select('*').execute()
    return res.data

@router.post("", dependencies=[Depends(require_admin)], response_model=UserOut)
def create_user(payload: UserCreate):
    # Phase 1: only create profile row (auth user creation later)
    insert = {
        'id': payload.email,  # TEMP placeholder id (replace with auth user id once real signup)
        'full_name': payload.full_name,
        'role': payload.role,
        'weekly_contribution': payload.weekly_contribution or 0,
        'joined_at': datetime.utcnow().isoformat()
    }
    res = supabase_client.supabase.table('profiles').insert(insert).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create user")
    out = res.data[0]
    out['email'] = payload.email
    return out

@router.patch("/{user_id}", dependencies=[Depends(require_admin)], response_model=UserOut)
def update_user(user_id: str, payload: UserUpdate):
    update_fields = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = supabase_client.supabase.table('profiles').update(update_fields).eq('id', user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data[0]

@router.get("/{user_id}", response_model=UserOut)
def get_user(user_id: str, user: UserContext = Depends(get_current_user)):
    if user.role != 'admin' and user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    res = supabase_client.supabase.table('profiles').select('*').eq('id', user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="User not found")
    return res.data[0]
