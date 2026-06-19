export const INQUIRY_INTENTS = [
  "general",
  "quote",
  "bulk",
  "investment",
  "partnership",
  "careers",
  "press",
] as const;

export type InquiryIntent = (typeof INQUIRY_INTENTS)[number];

export const INQUIRY_INTENT_LABELS: Record<InquiryIntent, string> = {
  general: "General",
  quote: "Product quote",
  bulk: "Bulk order",
  investment: "Investment",
  partnership: "Partnership",
  careers: "Careers",
  press: "Press / media",
};

export function inquiryIntentLabel(intent: string): string {
  return INQUIRY_INTENT_LABELS[intent as InquiryIntent] ?? intent.replace(/_/g, " ");
}
