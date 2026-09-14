/**
 * Price & Area Formatting Utilities
 *
 * Listing/rental prices from the observed API are numeric INR values.
 * These helpers are used for listing and rental UI.
 */

/**
 * Format a numeric INR amount using the Indian numbering system.
 *
 * Example:
 * 6610000 → ₹66,10,000
 */
export function formatINR(amount) {
  const num = Number(amount);

  if (!Number.isFinite(num)) {
    return '₹0';
  }

  return `₹${Math.round(num).toLocaleString('en-IN')}`;
}

/**
 * Format an INR amount into a compact Indian representation.
 *
 * Examples:
 * 6610000  → ₹66.1 L
 * 19500000 → ₹1.95 Cr
 * 50000    → ₹50,000
 */
export function formatCompactINR(amount) {
  const num = Number(amount);

  if (!Number.isFinite(num)) {
    return '₹0';
  }

  if (num >= 10000000) {
    const crores = num / 10000000;

    return `₹${crores
      .toFixed(crores < 10 ? 2 : 1)
      .replace(/\.0+$/, '')} Cr`;
  }

  if (num >= 100000) {
    const lakhs = num / 100000;

    return `₹${lakhs
      .toFixed(lakhs < 10 ? 2 : 1)
      .replace(/\.0+$/, '')} L`;
  }

  return formatINR(num);
}

/**
 * Calculate price per square foot using carpet area.
 *
 * Example:
 * price = 6610000
 * carpet_area = 825
 *
 * → ₹8,012 / sq.ft.
 */
export function formatPricePerSqft(
  price,
  carpetArea
) {
  const p = Number(price);
  const area = Number(carpetArea);

  if (
    !Number.isFinite(p) ||
    !Number.isFinite(area) ||
    p <= 0 ||
    area <= 0
  ) {
    return null;
  }

  const pricePerSqft = Math.round(
    p / area
  );

  return `₹${pricePerSqft.toLocaleString(
    'en-IN'
  )} / sq.ft.`;
}