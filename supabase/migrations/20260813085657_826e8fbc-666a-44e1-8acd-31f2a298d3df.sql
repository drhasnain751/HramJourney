-- Packages: accommodation + travel detail fields
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS makkah_hotel text,
  ADD COLUMN IF NOT EXISTS madinah_hotel text,
  ADD COLUMN IF NOT EXISTS hotel_category text,
  ADD COLUMN IF NOT EXISTS room_type text,
  ADD COLUMN IF NOT EXISTS accommodation_description text,
  ADD COLUMN IF NOT EXISTS departure_info text,
  ADD COLUMN IF NOT EXISTS flight_info text,
  ADD COLUMN IF NOT EXISTS travel_date_info text,
  ADD COLUMN IF NOT EXISTS transport_info text;

ALTER TABLE public.package_exclusions ADD COLUMN IF NOT EXISTS icon text;

-- Inquiries: complete customer information
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS adults integer,
  ADD COLUMN IF NOT EXISTS children integer,
  ADD COLUMN IF NOT EXISTS duration text,
  ADD COLUMN IF NOT EXISTS accommodation_tier text,
  ADD COLUMN IF NOT EXISTS selected_services text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS extra_info text;

UPDATE public.inquiries SET phone = 'Not provided' WHERE phone IS NULL OR btrim(phone) = '';
ALTER TABLE public.inquiries ALTER COLUMN phone SET NOT NULL;

-- Custom package requests: complete customer information
ALTER TABLE public.custom_package_requests
  ADD COLUMN IF NOT EXISTS travel_date date;

UPDATE public.custom_package_requests SET full_name = 'Not provided' WHERE full_name IS NULL OR btrim(full_name) = '';
UPDATE public.custom_package_requests SET email = 'not-provided@unknown.invalid' WHERE email IS NULL OR btrim(email) = '';
UPDATE public.custom_package_requests SET phone = 'Not provided' WHERE phone IS NULL OR btrim(phone) = '';
ALTER TABLE public.custom_package_requests ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE public.custom_package_requests ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.custom_package_requests ALTER COLUMN phone SET NOT NULL;

-- Site settings: admin-managed website imagery and content
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  image_url text,
  value text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT USING (true);

CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER site_settings_touch
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

INSERT INTO public.site_settings (key, label, description, display_order) VALUES
  ('home_hero_image', 'Homepage hero image', 'Full-width image behind the homepage headline.', 1),
  ('home_background_image', 'Homepage background image', 'Secondary background image used on the homepage.', 2),
  ('makkah_image', 'Makkah image', 'Image representing Makkah across the site.', 3),
  ('madinah_image', 'Madinah image', 'Image representing Madinah across the site.', 4),
  ('why_us_image', 'Why Us section image', 'Large image in the Why Haram Journey section.', 5),
  ('hotels_section_image', 'Hotels section image', 'Image used for the hotels section.', 6),
  ('services_section_image', 'Services section image', 'Image used for the services section.', 7),
  ('cta_section_image', 'CTA section image', 'Image used behind the closing call to action.', 8)
ON CONFLICT (key) DO NOTHING;