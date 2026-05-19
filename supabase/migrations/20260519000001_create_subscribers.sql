-- Create subscribers table to store newsletter subscriptions
CREATE TABLE IF NOT EXISTS subscribers (
    uuid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can subscribe)
CREATE POLICY "Allow public subscribe inserts" ON subscribers
    FOR INSERT WITH CHECK (true);

-- Allow authenticated admin full access
CREATE POLICY "Allow admin full access" ON subscribers
    FOR ALL USING (auth.role() = 'authenticated');
