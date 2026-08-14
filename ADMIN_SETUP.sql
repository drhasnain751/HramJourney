-- ADMIN_SETUP.sql
-- Use this in the Supabase SQL editor to grant admin role to an existing auth user.
-- Replace <USER_UUID> with the user's id from Supabase Authentication → Users

INSERT INTO public.user_roles (user_id, role)
VALUES ('<USER_UUID>', 'admin')
ON CONFLICT DO NOTHING;
