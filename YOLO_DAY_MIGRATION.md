# YOLO Day Migration Instructions

The YOLO Day feature requires a database table that doesn't exist yet. Follow these steps to create it:

## Option 1: Run via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (ysgbdwaccsfsdkmggzup)
3. Navigate to the SQL Editor (in the left sidebar)
4. Create a new query
5. Copy and paste the following SQL:

```sql
-- Create YOLO Days table for tracking days when users choose not to track
CREATE TABLE IF NOT EXISTS public.yolo_days (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure one YOLO day per user per date
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.yolo_days ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own YOLO days" ON public.yolo_days
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own YOLO days" ON public.yolo_days
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own YOLO days" ON public.yolo_days
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own YOLO days" ON public.yolo_days
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_yolo_days_user_date ON public.yolo_days(user_id, date);
```

6. Click "Run" to execute the migration

## Option 2: Run via Supabase CLI

If you have the Supabase CLI installed:

```bash
supabase db push
```

## Verification

After running the migration, verify it worked by:

1. Go to Table Editor in Supabase Dashboard
2. Check if `yolo_days` table appears in the list
3. The table should have the following columns:
   - id (uuid)
   - user_id (uuid)
   - date (date)
   - reason (text)
   - created_at (timestamptz)

Once the migration is complete, the YOLO Day feature should work properly on your Vercel deployment.