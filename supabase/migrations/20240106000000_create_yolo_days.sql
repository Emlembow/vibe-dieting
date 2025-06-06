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