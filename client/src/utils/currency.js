export function formatCurrency(value, locale = "en-NP", currency = "NPR") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

