import uuid
from app.db.supabase import get_supabase

supabase = get_supabase()

def get_recent_activities():
    response = supabase.table("activity_log") \
        .select("*") \
        .order("created_at", desc=True) \
        .limit(5) \
        .execute()
    
    data = response.data or []
    for d in data:
        if 'uuid' in d and d['uuid']:
            d['uuid'] = str(d['uuid'])
    return data

def log_activity(action: str, details: str):
    try:
        supabase.table("activity_log").insert({
            "uuid": str(uuid.uuid4()),
            "action": action,
            "details": details
        }).execute()
    except Exception as e:
        print(f"Failed to log activity: {e}")
