import { Package, Droplets, ShoppingCart, Info, Brush, Activity } from 'lucide-react';
import React from 'react';

export function IconMapper({ iconStr, className }: { iconStr: string, className?: string }) {
  if (iconStr === '📦' || iconStr === 'sugar' || iconStr === 'Box') return <Package className={className} />;
  if (iconStr === '🧼' || iconStr === 'soap' || iconStr === 'Droplets') return <Droplets className={className} />;
  if (iconStr === '🛒' || iconStr === 'ShoppingCart') return <ShoppingCart className={className} />;
  if (iconStr === '🧹' || iconStr === 'sweep' || iconStr === 'Brush') return <Brush className={className} />;
  if (iconStr === '🪣' || iconStr === 'mop') return <Activity className={className} />;
  if (iconStr === '🚽' || iconStr === 'toilet') return <Info className={className} />;
  if (iconStr && iconStr.trim() !== '' && iconStr !== 'Package') {
    // If it's a known non-emoji string without a mapping, or an emoji, just render it as text
    return <span className={`inline-flex items-center justify-center ${className || ''}`} style={{ lineHeight: 1 }}>{iconStr}</span>;
  }
  return <Package className={className} />;
}
