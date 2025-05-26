-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create macro_goals table
CREATE TABLE macro_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  daily_calorie_goal INTEGER DEFAULT 2000,
  protein_percentage INTEGER DEFAULT 30,
  carbs_percentage INTEGER DEFAULT 40,
  fat_percentage INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create food_entries table
CREATE TABLE food_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  name TEXT NOT NULL,
  description TEXT,
  calories INTEGER NOT NULL,
  protein_grams DECIMAL(10,2) NOT NULL,
  carbs_total_grams DECIMAL(10,2) NOT NULL,
  carbs_fiber_grams DECIMAL(10,2) DEFAULT 0,
  carbs_sugar_grams DECIMAL(10,2) DEFAULT 0,
  fat_total_grams DECIMAL(10,2) NOT NULL,
  fat_saturated_grams DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);