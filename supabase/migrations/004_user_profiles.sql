-- Supabase SQL Migration: Uživatelské profily
-- Spusťte v Supabase SQL Editor

-- Tabulka uživatelských profilů
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  uih TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'warehouse_user' CHECK (role IN ('admin', 'warehouse_user', 'readonly')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexy
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_id ON user_profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_uih ON user_profiles(uih);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Funkce pro automatické vytvoření profilu při registraci
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  next_num INTEGER;
  new_uih TEXT;
BEGIN
  -- Generování UIH: UIH001, UIH002...
  SELECT COALESCE(MAX(CAST(SUBSTRING(uih FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM user_profiles;
  
  new_uih := 'UIH' || LPAD(next_num::TEXT, 3, '0');
  
  INSERT INTO user_profiles (auth_id, email, uih, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    new_uih,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: automatické vytvoření profilu
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS politiky
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Uživatel vidí svůj profil
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_id);

-- Admin vidí všechny profily
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin může editovat profily
CREATE POLICY "Admins can update profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );
