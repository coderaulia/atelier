export interface InvoiceLineItem {
  desc: string;
  qty: number;
  rate: number;
}

export type TaxPreset = 'none' | 'ppn_11' | 'ppn_12' | 'custom';
export type TaxEffect = 'add' | 'deduct';

export interface InvoiceCalculations {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
}

export function calcLineTotal(qty: number = 0, rate: number = 0): number {
  const q = Number(qty) || 0;
  const r = Number(rate) || 0;
  return Math.round(q * r * 100) / 100;
}

export function calcSubtotal(items: InvoiceLineItem[] = []): number {
  return (items || []).reduce((sum, item) => sum + calcLineTotal(item.qty, item.rate), 0);
}

export function calcTax(subtotal: number, taxPct: number = 0): number {
  const pct = Number(taxPct) || 0;
  return Math.round(((subtotal * pct) / 100) * 100) / 100;
}

export function calcDiscount(subtotal: number, discountPct: number = 0): number {
  const pct = Number(discountPct) || 0;
  return Math.round(((subtotal * pct) / 100) * 100) / 100;
}

export function calcGrandTotal(
  subtotal: number,
  taxPct: number = 0,
  taxEffect: TaxEffect = 'add',
  discountPct: number = 0
): number {
  const tax = calcTax(subtotal, taxPct);
  const discount = calcDiscount(subtotal, discountPct);
  
  const total = taxEffect === 'deduct'
    ? subtotal - tax - discount
    : subtotal + tax - discount;
    
  return Math.max(0, Math.round(total * 100) / 100);
}

export function getInvoiceCalculations(data: {
  items?: InvoiceLineItem[];
  taxPct?: number;
  taxEffect?: TaxEffect;
  discountPct?: number;
}): InvoiceCalculations {
  const subtotal = calcSubtotal(data.items || []);
  const taxPct = Number(data.taxPct) || 0;
  const taxEffect = data.taxEffect || 'add';
  const discountPct = Number(data.discountPct) || 0;

  const taxAmount = calcTax(subtotal, taxPct);
  const discountAmount = calcDiscount(subtotal, discountPct);
  const grandTotal = calcGrandTotal(subtotal, taxPct, taxEffect, discountPct);

  return {
    subtotal,
    taxAmount,
    discountAmount,
    grandTotal,
  };
}

export const TAX_PRESETS: Array<{ id: TaxPreset; label: string; rate: number }> = [
  { id: 'none', label: 'Tanpa Pajak (0%)', rate: 0 },
  { id: 'ppn_11', label: 'PPN 11%', rate: 11 },
  { id: 'ppn_12', label: 'PPN 12%', rate: 12 },
  { id: 'custom', label: 'Kustom %', rate: 0 },
];
