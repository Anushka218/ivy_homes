/**
 * Price & Area Formatting Utilities
 * Standardizes Indian Rupee (INR) representation and square footage calculations.
 */

/**
 * Format full numeric amount into Indian numbering system (e.g. ₹66,10,000)
 */
export function formatINR(amount) {
  if (amount == null || isNaN(Number(amount))) return '₹0';
  const num = Math.round(Number(amount));
  return '₹' + num.toLocaleString('en-IN');
}

/**
 * Format numeric amount into compact human-readable Indian units (e.g. ₹66.1 L, ₹1.95 Cr)
 */
export function formatCompactINR(amount) {
  if (amount == null || isNaN(Number(amount))) return '₹0';
  const num = Number(amount);

  if (num >= 10000000) {
    // Crores (1 Cr = 1,00,00,000)
    const cr = num / 10000000;
    return `₹${cr.toFixed(cr < 10 ? 2 : 1).replace(/\.0+$/, '')} Cr`;
  }

  if (num >= 100000) {
    // Lakhs (1 Lakh = 1,00,000)
    const l = num / 100000;
    return `₹${l.toFixed(l < 10 ? 2 : 1).replace(/\.0+$/, '')} L`;
  }

  return formatINR(num);
}

/**
 * Calculate and format Price per square foot
 */
export function formatPricePerSqft(price, carpetArea) {
  const p = Number(price);
  const a = Number(carpetArea);
  if (!p || !a || a <= 0) return null;
  const ppsf = Math.round(p / a);
  return `₹${ppsf.toLocaleString('en-IN')} / sq.ft.`;
}
