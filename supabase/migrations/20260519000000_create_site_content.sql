-- Create site_content table to store key-value structured data
CREATE TABLE IF NOT EXISTS site_content (
    key VARCHAR PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) to protect backend content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create policies: everyone can read content, but only logged-in administrators can modify it
CREATE POLICY "Allow public read access" ON site_content
    FOR SELECT USING (true);

CREATE POLICY "Allow admin write access" ON site_content
    FOR ALL USING (auth.role() = 'authenticated');
