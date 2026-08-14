export function normalizeForTel(phone: string): string {
  if (!phone) return "";
  // Keep + if present, remove spaces, brackets, dashes
  const cleaned = phone.trim().replace(/[^+\d]/g, "");
  if (cleaned.startsWith("+")) return `tel:${cleaned}`;
  if (cleaned.startsWith("00")) return `tel:+${cleaned.slice(2)}`;
  // Handle Pakistani local format starting with 0 and '3' (e.g., 03001234567)
  if (/^0?3\d{9}$/.test(cleaned)) {
    const digits = cleaned.replace(/^0/, "");
    return `tel:+92${digits}`;
  }
  // If already international without + (e.g., 4479...), prefix +
  if (/^\d{9,}$/.test(cleaned)) return `tel:+${cleaned}`;
  return `tel:${cleaned}`;
}

export function normalizeForWhatsApp(phone: string): string {
  if (!phone) return "";
  let digits = phone.trim().replace(/[^\d]/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  // Pakistani local 03XXXXXXXXX -> 923XXXXXXXXX
  if (/^03\d{9}$/.test(digits)) {
    digits = `92${digits.slice(1)}`;
    return `https://wa.me/${digits}`;
  }
  // If starts with country code (e.g., 923 or 44...), use as-is
  if (/^\d{9,}$/.test(digits)) return `https://wa.me/${digits}`;
  return "";
}
