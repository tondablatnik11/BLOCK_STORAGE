-- ============================================
-- BLOCK STORAGE: Opravená migrace user_profiles
-- Spusťte v Supabase SQL Editor (nahrazuje 004)
-- ============================================

-- 1) Nejdříve odstraníme starý trigger a funkci (pokud existují)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2) Smazat starou tabulku (pokud existuje s chybnou strukturou)
DROP TABLE IF EXISTS user_profiles;

-- 3) Vytvořit tabulku znovu
CREATE TABLE public.user_profiles (
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

-- 4) Indexy
CREATE INDEX idx_user_profiles_auth_id ON public.user_profiles(auth_id);
CREATE INDEX idx_user_profiles_uih ON public.user_profiles(uih);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);

-- 5) VYPNOUT RLS na user_profiles (trigger potřebuje přístup)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Povolit čtení pro přihlášené uživatele
CREATE POLICY "Authenticated users can read profiles"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Povolit update pro vlastní profil
CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_id);

-- Povolit INSERT pro service role (trigger)
CREATE POLICY "Service role can insert"
  ON public.user_profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 6) Trigger funkce — SECURITY DEFINER + search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_num INTEGER;
  new_uih TEXT;
  user_name TEXT;
  custom_uih TEXT;
  is_first BOOLEAN;
BEGIN
  -- Zkontrolovat, jestli uživatel zadal vlastní UIH (z SAPu)
  custom_uih := NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'custom_uih', '')), '');
  
  IF custom_uih IS NOT NULL THEN
    -- Použít UIH zadané uživatelem
    new_uih := UPPER(custom_uih);
  ELSE
    -- Auto-generování UIH jako fallback
    SELECT COALESCE(MAX(
      CASE 
        WHEN uih ~ '^UIH[0-9]+$' 
        THEN CAST(SUBSTRING(uih FROM 4) AS INTEGER) 
        ELSE 0 
      END
    ), 0) + 1
    INTO next_num
    FROM public.user_profiles;
    
    new_uih := 'UIH' || LPAD(next_num::TEXT, 3, '0');
  END IF;
  
  -- Zjistit zda je to první uživatel (= admin)
  SELECT NOT EXISTS (SELECT 1 FROM public.user_profiles) INTO is_first;
  
  -- Bezpečné získání jména
  user_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    split_part(COALESCE(NEW.email, ''), '@', 1)
  );
  
  INSERT INTO public.user_profiles (auth_id, email, uih, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    new_uih,
    user_name,
    -- PRVNÍ uživatel = admin, ostatní = warehouse_user
    CASE 
      WHEN is_first THEN 'admin'
      ELSE 'warehouse_user'
    END
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Pokud trigger selže, alespoň nezablokuje registraci
  RAISE LOG 'handle_new_user error: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 7) Trigger na auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8) Povolit anon a authenticated přístup k tabulce
GRANT SELECT ON public.user_profiles TO anon;
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
