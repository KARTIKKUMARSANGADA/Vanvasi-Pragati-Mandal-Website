from app.db.supabase import get_supabase
from app.core import security

supabase = get_supabase()

def authenticate_admin(username: str, password: str):
    response = supabase.table("admins").select("*").eq("username", username).execute()
    if not response.data:
        return None
    
    admin = response.data[0]
    if not security.verify_password(password, admin["password"]):
        return None
        
    return admin
