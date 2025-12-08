-- Create the habits table
CREATE TABLE habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(7),
  reminder_time TIME,
  reminder_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  streak_count INTEGER DEFAULT 0
);

-- Create the habit_completions table
CREATE TABLE habit_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- Indexes
CREATE INDEX idx_habits_active ON habits(is_active);
CREATE INDEX idx_habits_created_at ON habits(created_at);
CREATE INDEX idx_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_completions_completed_at ON habit_completions(completed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Open policies (adjust later for authentication)
CREATE POLICY "read habits" ON habits FOR SELECT USING (true);
CREATE POLICY "insert habits" ON habits FOR INSERT WITH CHECK (true);
CREATE POLICY "update habits" ON habits FOR UPDATE USING (true);
CREATE POLICY "delete habits" ON habits FOR DELETE USING (true);

CREATE POLICY "read completions" ON habit_completions FOR SELECT USING (true);
CREATE POLICY "insert completions" ON habit_completions FOR INSERT WITH CHECK (true);
CREATE POLICY "update completions" ON habit_completions FOR UPDATE USING (true);
CREATE POLICY "delete completions" ON habit_completions FOR DELETE USING (true);
