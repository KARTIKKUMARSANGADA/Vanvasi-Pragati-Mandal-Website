from app.db.supabase import get_supabase

supabase = get_supabase()

def get_admin_stats():
    # 1. Count projects (fetching only id for size)
    proj_response = supabase.table("projects").select("id", count="exact").execute()
    projects_count = proj_response.count if proj_response.count is not None else len(proj_response.data or [])
    
    # 2. Count gallery images (fetching only id)
    gal_response = supabase.table("gallery").select("id", count="exact").execute()
    gallery_count = gal_response.count if gal_response.count is not None else len(gal_response.data or [])
    
    # 3. Count contact messages & fetch timestamps for chart (fetching only id and created_at)
    msg_response = supabase.table("contact_messages").select("id, created_at", count="exact").execute()
    messages_count = msg_response.count if msg_response.count is not None else len(msg_response.data or [])
    
    # 4. Fetch recent 5 projects (fetching all columns for display cards)
    recent_projects_resp = supabase.table("projects").select("*").order("created_at", desc=True).limit(5).execute()
    recent_projects = recent_projects_resp.data or []
    for p in recent_projects:
        if 'uuid' in p and p['uuid']:
            p['uuid'] = str(p['uuid'])
            
    # 5. Fetch recent 5 messages (fetching all columns for admin list)
    recent_messages_resp = supabase.table("contact_messages").select("*").order("created_at", desc=True).limit(5).execute()
    recent_messages = recent_messages_resp.data or []
    for m in recent_messages:
        if 'uuid' in m and m['uuid']:
            m['uuid'] = str(m['uuid'])

    # 6. Calculate chart data (messages per day for last 7 days)
    import datetime
    now = datetime.datetime.now(datetime.timezone.utc)
    chart_data = []
    for i in range(6, -1, -1):
        day = now - datetime.timedelta(days=i)
        day_str = day.strftime("%Y-%m-%d")
        day_msg_count = sum(1 for m in (msg_response.data or []) if str(m.get("created_at", "")).startswith(day_str))
        formatted_date = day.strftime("%b %d")
        chart_data.append({
            "date": formatted_date,
            "messages": day_msg_count
        })
            
    return {
        "projects": projects_count,
        "images": gallery_count,
        "messages": messages_count,
        "recent_projects": recent_projects,
        "recent_messages": recent_messages,
        "chart_data": chart_data
    }


def get_public_stats():
    # 1. Count projects & fetch categories (only id and category needed)
    proj_response = supabase.table("projects").select("id, category", count="exact").execute()
    total_projects = proj_response.count if proj_response.count is not None else len(proj_response.data or [])
    
    # 2. Count gallery images (only id needed)
    gal_response = supabase.table("gallery").select("id", count="exact").execute()
    gallery_images = gal_response.count if gal_response.count is not None else len(gal_response.data or [])
    
    # 3. Project Categories & Counts
    categories_dict = {}
    for p in proj_response.data or []:
        cat = p.get("category")
        if cat:
            cat = cat.strip().title()
        else:
            cat = "General"
        categories_dict[cat] = categories_dict.get(cat, 0) + 1
        
    categories_list = [{"name": name, "count": count} for name, count in categories_dict.items()]
    
    # 4. Years Active (since 2011)
    import datetime
    years_active = max(15, datetime.datetime.now().year - 2011)
    
    # 5. Beneficiary & Villages covered baselines + dynamic updates
    people_benefited = 50000 + (total_projects * 350)
    villages_covered = 120 + (total_projects * 3)
    
    return {
        "total_projects": total_projects,
        "gallery_images": gallery_images,
        "categories": categories_list,
        "years_active": years_active,
        "people_benefited": people_benefited,
        "villages_covered": villages_covered
    }

