import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(".env")

db_url = os.getenv("DATABASE_URL")

def run_migrations():
    print("Connecting to database...")
    try:
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cur = conn.cursor()

        # Add position to project_images
        print("Checking/Adding 'position' column in 'project_images'...")
        cur.execute("""
            ALTER TABLE project_images 
            ADD COLUMN IF NOT EXISTS position INT DEFAULT 0;
        """)
        print("Successfully checked/added 'position' column.")

        # Add site_content table
        print("Checking/Creating 'site_content' table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS site_content (
                key VARCHAR PRIMARY KEY,
                value JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Successfully checked/created 'site_content' table.")

        # Add subscribers table
        print("Checking/Creating 'subscribers' table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS subscribers (
                uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                email VARCHAR UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("Successfully checked/created 'subscribers' table.")

        cur.close()
        conn.close()
        print("Migrations completed successfully!")
    except Exception as e:
        print("Migration failed:", e)

if __name__ == "__main__":
    run_migrations()
