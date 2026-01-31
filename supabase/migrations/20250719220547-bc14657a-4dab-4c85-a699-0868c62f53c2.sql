-- Disable the automatic trigger since we'll create profiles manually
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;