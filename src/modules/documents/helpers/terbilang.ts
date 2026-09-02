/**
 * Indonesian Terbilang & Currency Words Utility
 */

const SATUAN_ID = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

export function terbilangIndonesian(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Nol';

  function convert(val: number): string {
    if (val < 12) {
      return SATUAN_ID[val];
    } else if (val < 20) {
      return convert(val - 10) + ' Belas';
    } else if (val < 100) {
      const sisa = val % 10;
      return convert(Math.floor(val / 10)) + ' Puluh' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 200) {
      const sisa = val - 100;
      return 'Seratus' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 1000) {
      const sisa = val % 100;
      return convert(Math.floor(val / 100)) + ' Ratus' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 2000) {
      const sisa = val - 1000;
      return 'Seribu' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 1000000) {
      const sisa = val % 1000;
      return convert(Math.floor(val / 1000)) + ' Ribu' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 1000000000) {
      const sisa = val % 1000000;
      return convert(Math.floor(val / 1000000)) + ' Juta' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 1000000000000) {
      const sisa = val % 1000000000;
      return convert(Math.floor(val / 1000000000)) + ' Miliar' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 1000000000000000) {
      const sisa = val % 1000000000000;
      return convert(Math.floor(val / 1000000000000)) + ' Triliun' + (sisa ? ' ' + convert(sisa) : '');
    }
    return String(val);
  }

  return convert(n).trim();
}

const ONES_EN = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS_EN = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function wordsEnglish(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero';

  function convert(val: number): string {
    if (val < 20) {
      return ONES_EN[val];
    } else if (val < 100) {
      const sisa = val % 10;
      return TENS_EN[Math.floor(val / 10)] + (sisa ? '-' + ONES_EN[sisa] : '');
    } else if (val < 1000) {
      const sisa = val % 100;
      return ONES_EN[Math.floor(val / 100)] + ' Hundred' + (sisa ? ' and ' + convert(sisa) : '');
    } else if (val < 1000000) {
      const sisa = val % 1000;
      return convert(Math.floor(val / 1000)) + ' Thousand' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 1000000000) {
      const sisa = val % 1000000;
      return convert(Math.floor(val / 1000000)) + ' Million' + (sisa ? ' ' + convert(sisa) : '');
    } else if (val < 1000000000000) {
      const sisa = val % 1000000000;
      return convert(Math.floor(val / 1000000000)) + ' Billion' + (sisa ? ' ' + convert(sisa) : '');
    }
    return String(val);
  }

  return convert(n).trim();
}

export function amountToWords(amount: number, currency: string = 'USD'): string {
  const c = (currency || 'USD').toUpperCase();
  if (c === 'IDR') {
    const words = terbilangIndonesian(amount);
    return `${words} Rupiah`;
  }
  
  const words = wordsEnglish(amount);
  const currencyLabels: Record<string, string> = {
    USD: 'Dollars',
    EUR: 'Euros',
    GBP: 'Pounds',
    SGD: 'Singapore Dollars',
    AUD: 'Australian Dollars',
    CAD: 'Canadian Dollars',
    JPY: 'Yen',
  };
  
  const unit = currencyLabels[c] || c;
  return `${words} ${unit}`;
}
