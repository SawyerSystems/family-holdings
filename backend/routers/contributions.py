from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user, require_admin, UserContext
import supabase_client
from models import ContributionCreate, ContributionOut, ContributionMarkPaid, ContributionUpdate
from datetime import datetime, date
import decimal
from db_utils import update_user_totals_after_contribution_change

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

@router.post("/{contribution_id}/mark-completed")
def mark_completed(contribution_id: str, payload: ContributionMarkPaid, user: UserContext = Depends(get_current_user)):
    # Fetch contribution
    res = supabase_client.supabase.table('contributions').select('*').eq('id', contribution_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
    contrib = res.data[0]
    if user.role != 'admin' and contrib['user_id'] != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    if contrib['status'] == 'paid':
        raise HTTPException(status_code=400, detail="Already completed")
    update = {
        'status': 'paid',
        'amount': float(payload.amount) if payload.amount is not None else contrib.get('amount'),
        'paid_at': datetime.utcnow().isoformat(),
        'method': payload.method or 'manual'
    }
    res2 = supabase_client.supabase.table('contributions').update(update).eq('id', contribution_id).execute()
    
    # Update user totals after contribution status change
    update_user_totals_after_contribution_change(contrib['user_id'])
    
    return res2.data[0] if res2.data else update

@router.post("/{contribution_id}/mark-late", dependencies=[Depends(require_admin)])
def mark_late(contribution_id: str):
    # Fetch contribution first to get user_id
    contrib_res = supabase_client.supabase.table('contributions').select('user_id').eq('id', contribution_id).execute()
    if not contrib_res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
    
    res = supabase_client.supabase.table('contributions').update({'status': 'late'}).eq('id', contribution_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
    
    # Update user totals after contribution status change
    update_user_totals_after_contribution_change(contrib_res.data[0]['user_id'])
    
    return res.data[0]

@router.post("/{contribution_id}/mark-missed", dependencies=[Depends(require_admin)])
def mark_missed(contribution_id: str):
    res = supabase_client.supabase.table('contributions').update({'status': 'missed'}).eq('id', contribution_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
    return res.data[0]

@router.patch("/{contribution_id}", dependencies=[Depends(require_admin)])
def update_contribution(contribution_id: str, payload: ContributionUpdate):
    update = {}
    for k, v in payload.dict(exclude_unset=True).items():
        if v is not None:
            # Convert non-JSON serializable types
            if isinstance(v, decimal.Decimal):
                update[k] = float(v)
            elif isinstance(v, date):
                update[k] = v.isoformat()
            else:
                update[k] = v
    
    if not update:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    res = supabase_client.supabase.table('contributions').update(update).eq('id', contribution_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Contribution not found")
    return res.data[0]

@router.delete("/{contribution_id}", dependencies=[Depends(require_admin)])
def delete_contribution(contribution_id: str):
    res = supabase_client.supabase.table('contributions').delete().eq('id', contribution_id).execute()
    return { 'deleted': bool(res.data) }
