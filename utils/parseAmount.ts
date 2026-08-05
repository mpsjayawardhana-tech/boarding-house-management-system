export function parseSmartAmount(inputValue: string, baseUnit: string): number | null {
  const trimmed = inputValue.trim();
  const match = trimmed.match(/^([\d.]+)\s*([a-zA-Z]*)$/);
  
  if (!match) return null; // Invalid format
  
  const extractedNumber = parseFloat(match[1]);
  if (isNaN(extractedNumber)) return null;
  
  const suffix = match[2].toLowerCase();
  
  if (baseUnit === 'g') {
    if (['kg', 'kilo', 'kilogram', 'kilograms'].includes(suffix)) {
      return extractedNumber * 1000;
    }
    return extractedNumber;
  }
  
  if (baseUnit === 'ml') {
    if (['l', 'liter', 'litre', 'liters', 'litres'].includes(suffix)) {
      return extractedNumber * 1000;
    }
    return extractedNumber;
  }
  
  // For pcs, packs, kg, L directly, etc., return as is.
  return extractedNumber;
}
