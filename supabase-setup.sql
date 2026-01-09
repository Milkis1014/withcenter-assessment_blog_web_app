-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Users can read all blogs" ON blogs;
DROP POLICY IF EXISTS "Users can create their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can update their own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can delete their own blogs" ON blogs;

-- Create policy to allow users to read all blogs
CREATE POLICY "Users can read all blogs" ON blogs
  FOR SELECT USING (true);

-- Create policy to allow users to create their own blogs
CREATE POLICY "Users can create their own blogs" ON blogs
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Create policy to allow users to update their own blogs
CREATE POLICY "Users can update their own blogs" ON blogs
  FOR UPDATE USING (auth.uid() = author_id);

-- Create policy to allow users to delete their own blogs
CREATE POLICY "Users can delete their own blogs" ON blogs
  FOR DELETE USING (auth.uid() = author_id);
