-- Add missing package fields for accommodation and travel info
ALTER TABLE public.packages 
ADD COLUMN IF NOT EXISTS accommodation_description text,
ADD COLUMN IF NOT EXISTS accommodation_tier text,
ADD COLUMN IF NOT EXISTS travel_info text;
