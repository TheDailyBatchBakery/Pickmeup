-- Add notification_preference to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS notification_preference VARCHAR(10) DEFAULT 'email' 
CHECK (notification_preference IN ('email', 'sms', 'both'));

-- Create settings table for admin configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on settings key for fast lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Function to update settings updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update settings updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Enable Row Level Security for settings
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy for settings (readable by everyone via API, but only service role can write)
CREATE POLICY "Settings are viewable by everyone via API"
  ON settings FOR SELECT
  USING (true);

-- Insert default settings
INSERT INTO settings (key, value) VALUES
  ('notifications', '{
    "statusChangeEnabled": true,
    "reminderEnabled": true,
    "reminderMinutes": 15,
    "reminderMethod": "simple"
  }'::jsonb),
  ('email_sms', '{
    "adminEmails": [],
    "adminPhones": [],
    "customerPreferenceTiming": "pre-order"
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

