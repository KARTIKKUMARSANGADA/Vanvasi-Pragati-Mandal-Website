import logging
from app.db.supabase import get_supabase

supabase = get_supabase()
logger = logging.getLogger(__name__)

DEFAULT_ABOUT = {
    "mission": "To empower rural and tribal communities through sustainable development initiatives, providing access to quality education, healthcare, and essential infrastructure, thereby ensuring self-reliance and improved standards of living.",
    "vision": "A society where every individual, regardless of their background or geographical location, has equal opportunities to thrive, contribute, and live with dignity in a supportive and self-sustaining community.",
    "story": "Established with a profound commitment to uplift the marginalized, Vanvasi Pragati Mandal Pipaliya has been a beacon of hope for tribal and rural populations. We act as a crucial link between government resources, benevolent donors, and the people at the grassroots level.\n\nOur approach is rooted in transparency, accountability, and real impact. Every project we undertake is meticulously planned and executed with community participation to ensure long-term sustainability.",
    "team": [
        {
            "name": "Sangada Devisingbhai",
            "role": "Founder & President",
            "image": "/src/assets/president.jpg",
            "contact": "+91 7874789633",
            "email": "",
            "bio": "With over two decades of experience in social work, Devisingbhai founded this trust to bring structured development to his native region. His relentless dedication has transformed countless lives."
        },
        {
            "name": "Kartikkumar Sangada",
            "role": "Core Member & Coordinator",
            "image": "/src/assets/coordinator.jpg",
            "contact": "+91 8140255951",
            "email": "kartiksangada2004@gmail.com",
            "bio": "Kartikkumar oversees the operational execution of projects. His expertise in ground-level management ensures that initiatives reach their intended beneficiaries efficiently."
        }
    ]
}

DEFAULT_TESTIMONIALS = [
    {
        "quote": "I never thought I could finish school after my father passed away. Vanvasi Pragati Mandal supported my education, and today I am the first college graduate in my village.",
        "name": "Ramesh Sangada",
        "role": "Student & Scholarship Recipient"
    },
    {
        "quote": "The medical camp saved my daughter's life. We couldn't afford the surgery, but the trust organized everything and covered all costs. We are forever grateful.",
        "name": "Meena Ben",
        "role": "Beneficiary Mother"
    }
]

def get_content(key: str) -> dict:
    """
    Fetch JSON content by key from site_content table.
    Falls back to hardcoded defaults on table/network failure or empty response.
    """
    try:
        response = supabase.table("site_content").select("*").eq("key", key).execute()
        if response.data and len(response.data) > 0:
            val = response.data[0].get("value")
            # If testimonials key, return the list within value['items'] or the value itself
            if key == "testimonials":
                if isinstance(val, dict) and "items" in val:
                    return val["items"]
            return val
    except Exception as e:
        logger.warning(f"Failed to fetch content for key '{key}' from Supabase (using fallback): {e}")

    # Fallbacks
    if key == "about":
        return DEFAULT_ABOUT
    elif key == "testimonials":
        return DEFAULT_TESTIMONIALS
    return {}

def update_content(key: str, value: dict) -> dict:
    """
    Insert or update content by key.
    """
    try:
        # Check if row exists first
        check_resp = supabase.table("site_content").select("key").eq("key", key).execute()
        
        payload = {
            "key": key,
            "value": value
        }
        
        if check_resp.data and len(check_resp.data) > 0:
            response = supabase.table("site_content").update({"value": value}).eq("key", key).execute()
        else:
            response = supabase.table("site_content").insert(payload).execute()
            
        try:
            from app.services import activity_service
            activity_service.log_activity("Update Content", f"Updated site content for '{key}'")
        except Exception as act_err:
            logger.error(f"Activity logging failed: {act_err}")

        if response.data and len(response.data) > 0:
            val = response.data[0].get("value")
            if key == "testimonials" and isinstance(val, dict) and "items" in val:
                return val["items"]
            return val
    except Exception as e:
        logger.error(f"Failed to update content for key '{key}': {e}")
        raise e
    
    return value
