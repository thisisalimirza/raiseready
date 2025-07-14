-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create packs table
CREATE TABLE IF NOT EXISTS public.packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  job_title TEXT NOT NULL,
  city_or_remote TEXT NOT NULL,
  current_salary INTEGER NOT NULL,
  target_salary INTEGER,
  achievements TEXT[] NOT NULL,
  market_data JSONB NOT NULL,
  negotiation_content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roleplay_sessions table
CREATE TABLE IF NOT EXISTS public.roleplay_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pack_id UUID REFERENCES public.packs(id) NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  confidence_score INTEGER DEFAULT 5 CHECK (confidence_score >= 1 AND confidence_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roleplay_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own packs" ON public.packs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own packs" ON public.packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packs" ON public.packs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packs" ON public.packs
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own roleplay sessions" ON public.roleplay_sessions
  FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.packs WHERE id = pack_id));

CREATE POLICY "Users can create own roleplay sessions" ON public.roleplay_sessions
  FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.packs WHERE id = pack_id));

CREATE POLICY "Users can update own roleplay sessions" ON public.roleplay_sessions
  FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.packs WHERE id = pack_id));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packs_user_id ON public.packs(user_id);
CREATE INDEX IF NOT EXISTS idx_roleplay_sessions_pack_id ON public.roleplay_sessions(pack_id);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();