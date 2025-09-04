from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user, require_admin, UserContext
import supabase_client
from models import ContributionCreate, ContributionOut, ContributionMarkPaid
from datetime import datetime

router = APIRouter(prefix="/contributions", tags=["contributions"])

@router.get("/mine")
def my_contributions(user: UserContext = Depends(get_current_user)):
    res = supabase_client.supabase.table('contributions').select('*').eq('user_id', user.id).execute()
    return res.data

@router.get("", dependencies=[Depends(require_admin)])
def all_contributions():
    return supabase_client.supabase.table('contributions').select('*').execute().data

@router.post("", dependencies=[Depends(require_admin)])
def create_contribution(payload: ContributionCreate):
    insert = payload.dict()
    insert['status'] = 'pending'
    
    # Convert Decimal fields to float for JSON serialization
    if 'expected_amount' in insert:
        insert['expected_amount'] = float(insert['expected_amount'])
    if 'paid_amount' in insert:
        insert['paid_amount'] = float(insert['paid_amount'])
    if 'late_fee' in insert:
        insert['late_fee'] = float(insert['late_fee'])
    
    res = supabase_client.supabase.table('contributions').insert(insert).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Failed to create contribution")
    return res.data[0]

@router.post("/{contribution_id}/mark-paid")
def mark_paid(contribution_id: str, payload: ContributionMarkPaid, user: UserContext = Depends(get_current_user)):
    # Fetch contribution
    res = supabase_client.supabase.table('contributions').select('*').eq('id', contribution_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
    contrib = res.data[0]
    if user.role != 'admin' and contrib['user_id'] != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if contrib['status'] == 'paid':
        raise HTTPException(status_code=400, detail="Already paid")
    update = {
        'status': 'paid',
        'paid_amount': float(payload.amount),
        'paid_at': datetime.utcnow().isoformat(),
        'method': payload.method or 'manual'
    }
    res2 = supabase_client.supabase.table('contributions').update(update).eq('id', contribution_id).execute()
    return res2.data[0] if res2.data else update
