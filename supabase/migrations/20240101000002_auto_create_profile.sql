-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, created_at, updated_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    now(),
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add a policy to allow the trigger function to insert profiles
-- This is needed because the trigger runs with SECURITY DEFINER
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Also update the existing insert policy to be more flexible during signup
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile during signup" ON profiles
  FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = profiles.id
      AND auth.users.created_at >= NOW() - INTERVAL '1 minute'
    )
  );