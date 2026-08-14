-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.is_admin());

-- Bootstrap: first registered account becomes the admin
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE existing int;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  SELECT count(*) INTO existing FROM public.user_roles WHERE role = 'admin';
  IF existing > 0 THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin')
    ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin');
$$;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- updated_at helper
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- PACKAGES
CREATE TABLE public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  package_type text NOT NULL DEFAULT 'Complete Umrah Package',
  short_description text,
  full_description text,
  duration text,
  tier text,
  badge text,
  status text NOT NULL DEFAULT 'draft',
  is_featured boolean NOT NULL DEFAULT false,
  is_popular boolean NOT NULL DEFAULT false,
  price_display_type text NOT NULL DEFAULT 'request_quote',
  starting_price numeric,
  price_text text,
  currency text NOT NULL DEFAULT 'GBP',
  price_notes text,
  main_image_url text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.packages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.packages TO authenticated;
GRANT ALL ON public.packages TO service_role;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published packages" ON public.packages
  FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can read all packages" ON public.packages
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins manage packages" ON public.packages
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER packages_touch BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.package_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'gallery',
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.package_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_images TO authenticated;
GRANT ALL ON public.package_images TO service_role;
ALTER TABLE public.package_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read images of published packages" ON public.package_images
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.packages p WHERE p.id = package_id AND p.status = 'published'));
CREATE POLICY "Admins manage package images" ON public.package_images
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.package_inclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  icon text,
  title text NOT NULL,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.package_inclusions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_inclusions TO authenticated;
GRANT ALL ON public.package_inclusions TO service_role;
ALTER TABLE public.package_inclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read inclusions of published packages" ON public.package_inclusions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.packages p WHERE p.id = package_id AND p.status = 'published'));
CREATE POLICY "Admins manage inclusions" ON public.package_inclusions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.package_exclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.package_exclusions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.package_exclusions TO authenticated;
GRANT ALL ON public.package_exclusions TO service_role;
ALTER TABLE public.package_exclusions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read exclusions of published packages" ON public.package_exclusions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.packages p WHERE p.id = package_id AND p.status = 'published'));
CREATE POLICY "Admins manage exclusions" ON public.package_exclusions
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- HOTELS
CREATE TABLE public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL DEFAULT 'Makkah',
  location text,
  star_rating int NOT NULL DEFAULT 5,
  distance_from_haram text,
  description text,
  facilities text[] NOT NULL DEFAULT '{}',
  main_image_url text,
  status text NOT NULL DEFAULT 'active',
  is_featured boolean NOT NULL DEFAULT false,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hotels TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotels TO authenticated;
GRANT ALL ON public.hotels TO service_role;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active hotels" ON public.hotels
  FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can read all hotels" ON public.hotels
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins manage hotels" ON public.hotels
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER hotels_touch BEFORE UPDATE ON public.hotels
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.hotel_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id uuid NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hotel_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hotel_images TO authenticated;
GRANT ALL ON public.hotel_images TO service_role;
ALTER TABLE public.hotel_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read images of active hotels" ON public.hotel_images
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.hotels h WHERE h.id = hotel_id AND h.status = 'active'));
CREATE POLICY "Admins manage hotel images" ON public.hotel_images
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- SERVICES
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon text,
  image_url text,
  status text NOT NULL DEFAULT 'active',
  show_in_builder boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active services" ON public.services
  FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can read all services" ON public.services
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins manage services" ON public.services
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER services_touch BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- INQUIRIES
CREATE TABLE public.inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  travelers int,
  departure_city text,
  travel_date date,
  package_type text,
  package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
  package_name text,
  message text,
  status text NOT NULL DEFAULT 'new',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inquiries TO authenticated;
GRANT ALL ON public.inquiries TO service_role;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage inquiries" ON public.inquiries
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER inquiries_touch BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CUSTOM PACKAGE REQUESTS
CREATE TABLE public.custom_package_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  email text,
  phone text,
  country text,
  selected_services text[] NOT NULL DEFAULT '{}',
  adults int NOT NULL DEFAULT 1,
  children int NOT NULL DEFAULT 0,
  travel_month text,
  duration text,
  accommodation_tier text,
  transport_preference text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.custom_package_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_package_requests TO authenticated;
GRANT ALL ON public.custom_package_requests TO service_role;
ALTER TABLE public.custom_package_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a custom request" ON public.custom_package_requests
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage custom requests" ON public.custom_package_requests
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER custom_requests_touch BEFORE UPDATE ON public.custom_package_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- MEDIA LIBRARY
CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path text NOT NULL,
  public_url text NOT NULL,
  file_name text NOT NULL,
  folder text NOT NULL DEFAULT 'general',
  file_size int,
  mime_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read media" ON public.media
  FOR SELECT USING (true);
CREATE POLICY "Admins manage media" ON public.media
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
