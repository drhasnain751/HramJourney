import { supabase } from "@/integrations/supabase/client";

export function validateLead(input: {
  full_name: string;
  email: string;
  phone: string;
}): string | null {
  if (input.full_name.trim().length < 2) return "Please enter your full name.";
  if (input.full_name.trim().length > 100) return "Name must be under 100 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email.trim())) {
    return "Please enter a valid email address.";
  }
  const digits = input.phone.replace(/[^\d]/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return "Please enter a valid phone number including the country code.";
  }
  return null;
}

export interface InquiryPayload {
  full_name: string;
  email: string;
  phone: string;
  country?: string | null;
  travelers?: number | null;
  adults?: number | null;
  children?: number | null;
  departure_city?: string | null;
  travel_date?: string | null;
  duration?: string | null;
  accommodation_tier?: string | null;
  selected_services?: string[];
  package_type?: string | null;
  package_id?: string | null;
  package_name?: string | null;
  message?: string | null;
  extra_info?: string | null;
}

export async function submitInquiry(payload: InquiryPayload) {
  const invalid = validateLead(payload);
  if (invalid) throw new Error(invalid);

  const { error } = await supabase.from("inquiries").insert({
    ...payload,
    full_name: payload.full_name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    travel_date: payload.travel_date || null,
    selected_services: payload.selected_services ?? [],
  });
  if (error) throw error;
}

export interface CustomRequestPayload {
  full_name: string;
  email: string;
  phone: string;
  country?: string | null;
  selected_services: string[];
  adults: number;
  children: number;
  travel_month?: string | null;
  travel_date?: string | null;
  duration?: string | null;
  accommodation_tier?: string | null;
  transport_preference?: string | null;
  notes?: string | null;
}

export async function submitCustomRequest(payload: CustomRequestPayload) {
  const invalid = validateLead(payload);
  if (invalid) throw new Error(invalid);

  const { error } = await supabase.from("custom_package_requests").insert({
    ...payload,
    full_name: payload.full_name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    travel_date: payload.travel_date || null,
  });
  if (error) throw error;
}
