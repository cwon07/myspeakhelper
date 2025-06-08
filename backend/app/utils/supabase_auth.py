import os
from supabase import create_client, Client
from fastapi import HTTPException, Depends, Request

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY=os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async def get_current_user(request: Request):
    """
    Validates the Bearer token from the Authorization header,
    returns the authenticated user's data(dict containing 'id', 'email', etc.)
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing auth header")
    
    parts = auth_header.split(" ")
    if len(parts) !=2 or parts[0] != "Bearer":
        raise HTTPException(status_code=401, detail="Invalid auth header format")
    
    token = parts[1]
    user_resp = supabase.auth.get_user(token)
    if user_resp.user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user_resp.user