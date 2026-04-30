

import jsPDF from 'jspdf';
import QRCode from 'qrcode';
// @ts-ignore — no types for arabic-reshaper
import reshaper from 'arabic-reshaper';
import bidiFactory from 'bidi-js';


import type { InvoiceWithDetails } from '../types/invoice.types';
import {
  NOTO_ARABIC_REGULAR_B64,
  NOTO_ARABIC_BOLD_B64,
  NOTO_LATIN_REGULAR_B64,
  NOTO_LATIN_BOLD_B64,
} from './invoiceFonts.ts';

export interface OrgDetails {
  name: string;
  name_ar?: string;
  vat_number: string;
  cr_number?: string;
  address?: string;
  address_ar?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_base64?: string;   // PNG/JPEG base64 without data-URI prefix
  logo_mime?: 'PNG' | 'JPEG';
  bank_name?: string;
  bank_iban?: string;
  signatory_name?: string;
  signatory_title?: string;
}
// console.log(bidi);
const bidi = bidiFactory();

function shapeAr(text: string | null | undefined): string {
  if (!text) return '';

  if (!/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) {
    return text;
  }

  const reshaped = reshaper.convertArabic(text); // ✅ FIXED
  const levels   = bidi.getEmbeddingLevels(reshaped, 'rtl');
  return bidi.getReorderedString(reshaped, levels);
}

// ─── Amount in Arabic words ───────────────────────────────────────────────────
// function amountToArabicWords(amount: number, currency: string): string {
//   const ones = [
//     '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة',
//     'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر',
//     'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر',
//   ];
//   const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];

//   const numToWords = (n: number): string => {
//     if (n === 0) return 'صفر';
//     if (n < 20)  return ones[n];
//     if (n < 100) {
//       const o = ones[n % 10];
//       return o ? `${o} و${tens[Math.floor(n / 10)]}` : tens[Math.floor(n / 10)];
//     }
//     if (n < 1000) {
//       const h = Math.floor(n / 100); const rem = n % 100;
//       const hStr = h === 1 ? 'مائة' : h === 2 ? 'مئتان' : `${ones[h]} مائة`;
//       return rem ? `${hStr} و${numToWords(rem)}` : hStr;
//     }
//     if (n < 10000) {
//       const th = Math.floor(n / 1000); const rem = n % 1000;
//       const thStr = th === 1 ? 'ألف' : th === 2 ? 'ألفان' : `${ones[th]} آلاف`;
//       return rem ? `${thStr} و${numToWords(rem)}` : thStr;
//     }
//     return n.toLocaleString('ar-SA');
//   };

//   const intPart = Math.floor(amount);
//   const decPart = Math.round((amount - intPart) * 100);
//   const cur = currency === 'SAR' ? 'ريال سعودي' : currency === 'USD' ? 'دولار أمريكي' : currency;
//   const sub = currency === 'SAR' ? 'هللة' : 'سنت';
//   const main = `${numToWords(intPart)} ${cur}`;
//   return decPart > 0
//     ? `${main} و${numToWords(decPart)} ${sub} فقط لا غير`
//     : `${main} فقط لا غير`;
// }

// Amount in English words (for "Amount In Words:" line)
function amountToEnglishWords(amount: number, currency: string): string {
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen',
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const numToWords = (n: number): string => {
    if (n === 0) return 'Zero';
    if (n < 20)  return ones[n];
    if (n < 100) {
      const o = ones[n % 10];
      return o ? `${tens[Math.floor(n / 10)]}-${o}` : tens[Math.floor(n / 10)];
    }
    if (n < 1000) {
      const rem = n % 100;
      return `${ones[Math.floor(n / 100)]} Hundred${rem ? ' ' + numToWords(rem) : ''}`;
    }
    if (n < 1_000_000) {
      const rem = n % 1000;
      return `${numToWords(Math.floor(n / 1000))} Thousand${rem ? ' ' + numToWords(rem) : ''}`;
    }
    return n.toLocaleString();
  };

  const intPart = Math.floor(amount);
  const decPart = Math.round((amount - intPart) * 100);
  const cur = currency === 'SAR' ? 'riyals' : currency.toLowerCase();
  const sub = currency === 'SAR' ? 'halalas' : 'cents';
  const main = `${numToWords(intPart)} ${cur}`;
  return decPart > 0
    ? `${main} and ${numToWords(decPart)} ${sub} only`
    : `${main} only`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function generateInvoicePdf(
  invoice: InvoiceWithDetails,
  org?: OrgDetails,
): Promise<void> {

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W  = 210;
  const ML = 14;
  const MR = W - ML;
  const CW = MR - ML;

  // ── Register fonts ──────────────────────────────────────────────────────────
  doc.addFileToVFS('NotoArabic-Regular.ttf', NOTO_ARABIC_REGULAR_B64);
  doc.addFont('NotoArabic-Regular.ttf', 'NotoArabic', 'normal');
  doc.addFileToVFS('NotoArabic-Bold.ttf', NOTO_ARABIC_BOLD_B64);
  doc.addFont('NotoArabic-Bold.ttf', 'NotoArabic', 'bold');
  doc.addFileToVFS('NotoLatin-Regular.ttf', NOTO_LATIN_REGULAR_B64);
  doc.addFont('NotoLatin-Regular.ttf', 'NotoLatin', 'normal');
  doc.addFileToVFS('NotoLatin-Bold.ttf', NOTO_LATIN_BOLD_B64);
  doc.addFont('NotoLatin-Bold.ttf', 'NotoLatin', 'bold');

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const h2r = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });
  const fill   = (hex: string) => { const c = h2r(hex); doc.setFillColor(c.r, c.g, c.b); };
  const stroke = (hex: string) => { const c = h2r(hex); doc.setDrawColor(c.r, c.g, c.b); };
  const color  = (hex: string) => { const c = h2r(hex); doc.setTextColor(c.r, c.g, c.b); };

  type Align = 'left' | 'right' | 'center';

  /**
   * Render text. Detects Arabic automatically unless lang is forced.
   * `maxWidth` enables word-wrap via jsPDF splitTextToSize.
   */
  const txt = (
    str: string | null | undefined,
    x: number,
    y: number,
    opts?: {
      size?: number;
      bold?: boolean;
      col?: string;
      align?: Align;
      lang?: 'ar' | 'en' | 'auto';
      maxWidth?: number;
    },
  ) => {
    if (!str) return;
    const isAr =
      opts?.lang === 'ar' ||
      (opts?.lang !== 'en' && /[\u0600-\u06FF]/.test(str));
    const family = isAr ? 'NotoArabic' : 'NotoLatin';
    try {
      doc.setFont(family, opts?.bold ? 'bold' : 'normal');
    } catch {
      doc.setFont('Helvetica', 'normal');
    }
    doc.setFontSize(opts?.size ?? 8.5);
    color(opts?.col ?? '#1A1A2E');
    const rendered = isAr ? shapeAr(str) : str;
    if (opts?.maxWidth) {
      const lines = doc.splitTextToSize(rendered, opts.maxWidth);
      doc.text(lines, x, y, { align: opts?.align ?? 'left' });
    } else {
      doc.text(rendered, x, y, { align: opts?.align ?? 'left' });
    }
  };

  const hline = (y: number, x1 = ML, x2 = MR, col = '#D1D5DB', lw = 0.2) => {
    stroke(col);
    doc.setLineWidth(lw);
    doc.line(x1, y, x2, y);
  };

  const vline = (x: number, y1: number, y2: number, col = '#D1D5DB', lw = 0.2) => {
    stroke(col);
    doc.setLineWidth(lw);
    doc.line(x, y1, x, y2);
  };

  const box = (x: number, y: number, w: number, h: number, col = '#D1D5DB', lw = 0.2) => {
    stroke(col);
    doc.setLineWidth(lw);
    doc.rect(x, y, w, h, 'S');
  };

  let y = 0;

  // ══════════════════════════════════════════════════════════════════════════
  //  1. COMPANY HEADER  (white background, logo left, details right)
  // ══════════════════════════════════════════════════════════════════════════
  const HEADER_H = 36;

  // Optional logo
  const LOGO_SIZE = 26;
  let headerTextX = ML;

  if (org?.logo_base64) {
    try {
      doc.addImage(
        org.logo_base64,
        org?.logo_mime ?? 'PNG',
        ML, y + 4,
        LOGO_SIZE, LOGO_SIZE,
      );
      headerTextX = ML + LOGO_SIZE + 4;
    } catch { /* skip on error */ }
  }

  // Company name
  const orgName   = org?.name   ?? 'Your Organization';
  const orgNameAr = org?.name_ar ?? '';

  txt(orgName, headerTextX, y + 10, { size: 13, bold: true, lang: 'en' });
  if (orgNameAr) {
    txt(orgNameAr, headerTextX, y + 17, { size: 10, bold: true, lang: 'ar' });
  }

  // Sub-details: VAT / address / contact / email / website — small font
  const detailLines: string[] = [];
  if (org?.vat_number)  detailLines.push(`VAT : ${org.vat_number}`);
  if (org?.address)     detailLines.push(org.address);
  if (org?.phone)       detailLines.push(`Contact No.- ${org.phone}`);
  if (org?.email)       detailLines.push(`Email- ${org.email}`);
  if (org?.website)     detailLines.push(`Website- ${org.website}`);

  let dy = orgNameAr ? y + 22 : y + 17;
  detailLines.forEach(line => {
    txt(line, headerTextX, dy, { size: 7, col: '#374151', lang: 'en' });
    dy += 4.2;
  });

  y += HEADER_H;

  // Thin separator under header
  hline(y, ML, MR, '#000000', 0.2); 
  y += 1;

  // ══════════════════════════════════════════════════════════════════════════
  //  2. TITLE BLOCK  — centered bilingual title
  // ══════════════════════════════════════════════════════════════════════════
  y += 5;
  txt('VAT Invoice', W / 2, y, { size: 16, bold: true, col: '#000000', align: 'center', lang: 'en' });
  y += 7;
  txt('فاتورة ضريبة القيمة المضافة', W / 2, y, { size: 13, bold: true, col: '#000000', align: 'center', lang: 'ar' });
  y += 8;

  // hline(y, ML, MR, '#000000', 0.4);
  y += 3;

  // ══════════════════════════════════════════════════════════════════════════
  //  3. THREE-COLUMN INFO ROW  — Bill To | QR | Invoice Meta
  //     Widths: ~55mm | ~45mm | ~84mm
  // ══════════════════════════════════════════════════════════════════════════
  const INFO_ROW_Y = y;
  const COL1_W = 60;   // Bill To
  const COL2_W = 40;   // QR Code
  // const COL3_W = CW - COL1_W - COL2_W; // Invoice meta

  const COL1_X = ML;
  const COL2_X = ML + COL1_W;
  const COL3_X = ML + COL1_W + COL2_W;

  // ── QR Code (center column) ──────────────────────────────────────────────
  const QR_SIZE = 34;
  let qrRendered = false;
  if (invoice.qr_code) {
    try {
      const qrDataUrl = await QRCode.toDataURL(invoice.qr_code, {
        width: 256, margin: 1, errorCorrectionLevel: 'M',
        color: { dark: '#000000', light: '#FFFFFF' },
      });
      const qrX = COL2_X + (COL2_W - QR_SIZE) / 2;
      doc.addImage(qrDataUrl, 'PNG', qrX, INFO_ROW_Y + 2, QR_SIZE, QR_SIZE);
      qrRendered = true;
    } catch { /* skip */ }
  }

  // ── Bill To (left column) ────────────────────────────────────────────────
  let by = INFO_ROW_Y + 5;

  txt('Bill To:', COL1_X, by, { size: 8.5, bold: true, lang: 'en' });
  txt('فاتورة إلى', COL1_X, by + 4, { size: 7, col: '#6B7280', lang: 'ar' });
  by += 10;

  // Customer name + VAT if available
  const customerVat = (invoice as any).customer_vat_number ?? '';
  txt('Name', COL1_X, by, { size: 7.5, bold: true, col: '#374151', lang: 'en' });
  txt('اسم', COL1_X, by + 3.5, { size: 6.5, col: '#9CA3AF', lang: 'ar' });
  // const nameVal = customerVat
  //   ? `${invoice.customer_name}\n VAT -${customerVat}`
  //   : `: ${invoice.customer_name}`;
  txt(`: ${invoice.customer_name}`, COL1_X + 16, by, { size: 7.5, lang: 'en' });
  if (customerVat) {
    txt(`VAT -${customerVat}`, COL1_X + 16, by + 4, { size: 7, col: '#374151', lang: 'en' });
    by += 4;
  }
  by += 7;

  if (invoice.customer_email) {
    txt('Email', COL1_X, by, { size: 7.5, bold: true, col: '#374151', lang: 'en' });
    txt('البريد الإلكتروني', COL1_X, by + 3.5, { size: 6, col: '#9CA3AF', lang: 'ar' });
    txt(`: ${invoice.customer_email}`, COL1_X + 16, by, { size: 7, lang: 'en', maxWidth: COL1_W - 18 });
    by += 8;
  }

  const customerPhone = (invoice as any).customer_phone ?? '';
  if (customerPhone) {
    txt('Contact #', COL1_X, by, { size: 7.5, bold: true, col: '#374151', lang: 'en' });
    txt('اتصل#', COL1_X, by + 3.5, { size: 6, col: '#9CA3AF', lang: 'ar' });
    txt(`: ${customerPhone}`, COL1_X + 16, by, { size: 7.5, lang: 'en' });
    by += 8;
  }

  const customerAddress = (invoice as any).customer_address ?? '';
  if (customerAddress) {
    txt('Address', COL1_X, by, { size: 7.5, bold: true, col: '#374151', lang: 'en' });
    txt('عنوان', COL1_X, by + 3.5, { size: 6, col: '#9CA3AF', lang: 'ar' });
    txt(`: ${customerAddress}`, COL1_X + 16, by, { size: 7, lang: 'en', maxWidth: COL1_W - 18 });
    by += 8;
  }

  // ── Invoice Meta (right column) ──────────────────────────────────────────
  const metaRows: Array<{ en: string; ar: string; val: string }> = [
    { en: 'Invoice #',    ar: 'رقم الفاتورة',        val: invoice.invoice_number },
    { en: 'Invoice Date', ar: 'تاريخ الفاتورة',      val: invoice.issue_date },
    { en: 'Due Date',     ar: 'تاريخ الاستحقاق',     val: invoice.due_date },
  ];

  const poNumber = (invoice as any).po_number ?? '';
  if (poNumber) {
    metaRows.push({ en: 'PO #', ar: 'رقم أمر الشراء', val: poNumber });
  }

  // Each meta row: label on left of col3, value right-aligned
  let my = INFO_ROW_Y + 5;
  metaRows.forEach(({ en, ar, val }) => {
    // English label (bold)
    txt(en, COL3_X, my, { size: 8, bold: true, col: '#111827', lang: 'en' });
    // Arabic label below
    txt(ar, COL3_X, my + 3.5, { size: 6.5, col: '#6B7280', lang: 'ar' });
    // Value right-aligned
    txt(`: ${val}`, MR, my, { size: 8, col: '#111827', align: 'right', lang: 'en' });
    my += 10;
  });

  // Advance y past the info row (take max of the three columns)
  const infoRowHeight = Math.max(by - INFO_ROW_Y, qrRendered ? QR_SIZE + 6 : 0, my - INFO_ROW_Y) + 4;
  y = INFO_ROW_Y + infoRowHeight;

  // hline(y, ML, MR, '#000000', 0.4);
  y += 1;

  // ══════════════════════════════════════════════════════════════════════════
  //  4. LINE ITEMS TABLE
  // ══════════════════════════════════════════════════════════════════════════

  // Column layout — mirroring the PDF exactly:
  //  #  | Description  | Qty | Rate | Taxable Amount | Tax (SAR) | Net Amount
  const COL = {
    no:      { x: ML,       w: 8  },
    desc:    { x: ML + 8,   w: 62 },
    qty:     { x: ML + 70,  w: 14 },
    rate:    { x: ML + 84,  w: 20 },
    taxable: { x: ML + 104, w: 28 },
    tax:     { x: ML + 132, w: 24 },
    net:     { x: ML + 156, w: MR - (ML + 156) },
  };

  const TABLE_HEADER_H = 14;

  // Table header background (light grey)
  fill('#F3F4F6');
  doc.rect(ML, y, CW, TABLE_HEADER_H, 'F');

  // Header outer border
  box(ML, y, CW, TABLE_HEADER_H, '#000000', 0.3);

  // Column header text  — English (bold) + Arabic below
  const headers: Array<{ en: string; ar: string; colKey: keyof typeof COL; align?: Align }> = [
    { en: '#',              ar: '#',             colKey: 'no',      align: 'center' },
    { en: 'Description',   ar: 'الوصف',          colKey: 'desc'                    },
    { en: 'Qty',            ar: 'الكمية',         colKey: 'qty',     align: 'center' },
    { en: 'Rate',           ar: 'معدل',           colKey: 'rate',    align: 'center' },
    { en: 'Taxable Amount', ar: 'المبلغ الخاضع للضريبة', colKey: 'taxable', align: 'center' },
    { en: 'Tax (SAR)',      ar: 'الضريبة',        colKey: 'tax',     align: 'center' },
    { en: 'Net Amount',     ar: 'المبلغ الصافي',  colKey: 'net',     align: 'center' },
  ];

  headers.forEach(({ en, ar, colKey, align = 'left' }) => {
    const col = COL[colKey];
    const cx  = align === 'center' ? col.x + col.w / 2
              : align === 'right'  ? col.x + col.w - 2
              : col.x + 2;
    txt(en, cx, y + 5.5, { size: 7.5, bold: true, col: '#111827', align, lang: 'en' });
    txt(ar, cx, y + 10.5, { size: 6,   bold: false, col: '#6B7280', align, lang: 'ar' });
  });

  // Vertical dividers inside header
  Object.values(COL).slice(0, -1).forEach(col => {
    vline(col.x + col.w, y, y + TABLE_HEADER_H, '#9CA3AF', 0.15);
  });

  y += TABLE_HEADER_H;

  // ── Line item rows ───────────────────────────────────────────────────────
  invoice.line_items.forEach((li, idx) => {
    if (y > 240) { doc.addPage(); y = 14; }

    const excl = Number(li.line_total_excl_vat);
    const vatA = Number(li.vat_amount);
    const incl = Number(li.line_total_incl_vat);

    // Estimate row height (description may wrap)
    const descLines = doc.setFont('NotoLatin', 'normal')
      && doc.splitTextToSize(li.item_name, COL.desc.w - 4);
    const arLines = li.item_name_ar
      ? doc.splitTextToSize(shapeAr(li.item_name_ar), COL.desc.w - 4)
      : [];
    const ROW_H = Math.max(
      (descLines.length + arLines.length) * 4 + 6,
      12,
    );

    // Alternating row background
    if (idx % 2 === 1) {
      fill('#F9FAFB');
      doc.rect(ML, y, CW, ROW_H, 'F');
    }

    // Row border
    box(ML, y, CW, ROW_H, '#D1D5DB', 0.15);

    const ry = y + ROW_H / 2 + 1.5; // vertical center

    // #
    txt(String(idx + 1), COL.no.x + COL.no.w / 2, ry, { size: 7.5, col: '#374151', align: 'center', lang: 'en' });

    // Description (English + optional Arabic below)
    let dly = y + 5;
    descLines.forEach((line: string) => {
      txt(line, COL.desc.x + 2, dly, { size: 7.5, col: '#111827', lang: 'en' });
      dly += 4;
    });
    if (li.item_name_ar) {
      arLines.forEach((line: string) => {
        txt(line, COL.desc.x + COL.desc.w - 2, dly, { size: 6.5, col: '#6B7280', align: 'right', lang: 'ar' });
        dly += 4;
      });
    }

    // Qty
    txt(String(li.quantity), COL.qty.x + COL.qty.w / 2, ry, { size: 7.5, align: 'center', lang: 'en' });

    // Rate
    txt(Number(li.unit_price).toFixed(2), COL.rate.x + COL.rate.w / 2, ry, { size: 7.5, align: 'center', lang: 'en' });

    // Taxable Amount (excl VAT)
    txt(excl.toFixed(2), COL.taxable.x + COL.taxable.w / 2, ry, { size: 7.5, align: 'center', lang: 'en' });

    // Tax
    const vatRate = Number(li.vat_rate).toFixed(0);
    txt(`${vatA.toFixed(2)}`, COL.tax.x + COL.tax.w / 2, ry - 1.5, { size: 7.5, align: 'center', lang: 'en' });
    txt(`(VAT ${vatRate}%)`, COL.tax.x + COL.tax.w / 2, ry + 3, { size: 6, col: '#6B7280', align: 'center', lang: 'en' });

    // Net Amount
    txt(incl.toFixed(2), COL.net.x + COL.net.w / 2, ry, { size: 7.5, bold: true, align: 'center', lang: 'en' });

    // Vertical dividers
    Object.values(COL).slice(0, -1).forEach(col => {
      vline(col.x + col.w, y, y + ROW_H, '#D1D5DB', 0.15);
    });

    y += ROW_H;
  });

  // ── Totals row ───────────────────────────────────────────────────────────
  const TOT_H = 10;
  fill('#F3F4F6');
  doc.rect(ML, y, CW, TOT_H, 'F');
  box(ML, y, CW, TOT_H, '#000000', 0.3);

  // "Total / الإجمالي" label spanning up to taxable column
  txt('Total', COL.taxable.x - 10, y + 6.5, { size: 8, bold: true, col: '#111827', align: 'right', lang: 'en' });
  txt('الإجمالي', COL.taxable.x - 2, y + 6.5, { size: 7.5, bold: true, col: '#111827', align: 'right', lang: 'ar' });

  const totalExcl = invoice.line_items.reduce((s, li) => s + Number(li.line_total_excl_vat), 0);
  const totalVat  = Number(invoice.vat_total);
  const totalIncl = Number(invoice.grand_total);

  txt(totalExcl.toFixed(2), COL.taxable.x + COL.taxable.w / 2, y + 6.5, { size: 8, bold: true, align: 'center', lang: 'en' });
  txt(totalVat.toFixed(2),  COL.tax.x     + COL.tax.w     / 2, y + 6.5, { size: 8, bold: true, align: 'center', lang: 'en' });
  txt(totalIncl.toFixed(2), COL.net.x     + COL.net.w     / 2, y + 6.5, { size: 8, bold: true, align: 'center', lang: 'en' });

  // Vertical dividers in totals row
  Object.values(COL).slice(0, -1).forEach(col => {
    vline(col.x + col.w, y, y + TOT_H, '#9CA3AF', 0.15);
  });

  y += TOT_H;

  // ── Net Amount summary box ───────────────────────────────────────────────
  const NET_BOX_H = 10;
  fill('#F9FAFB');
  doc.rect(ML, y, CW, NET_BOX_H, 'F');
  box(ML, y, CW, NET_BOX_H, '#000000', 0.3);

  txt('Net Amount', COL.tax.x + 2, y + 6.5, { size: 8, bold: true, lang: 'en' });
  txt('المبلغ الصافي', MR - 2, y + 6.5, { size: 7, col: '#6B7280', align: 'right', lang: 'ar' });
  txt(
    `${invoice.currency_code} ${totalIncl.toFixed(2)}`,
    COL.net.x + COL.net.w / 2, y + 6.5,
    { size: 9, bold: true, col: '#059669', align: 'center', lang: 'en' },
  );

  y += NET_BOX_H + 5;

  // ── Amount in words ──────────────────────────────────────────────────────
  const amtWords = amountToEnglishWords(totalIncl, invoice.currency_code);
  txt('Amount In Words:', ML, y, { size: 8, bold: true, lang: 'en' });
  txt(amtWords, ML + 33, y, { size: 8, lang: 'en', maxWidth: CW - 35 });
  y += 6;

  hline(y, ML, MR, '#D1D5DB', 0.2);
  y += 5;

  // ══════════════════════════════════════════════════════════════════════════
  //  5. BANK DETAILS  +  NOTES  +  SIGNATURE
  // ══════════════════════════════════════════════════════════════════════════
  const hasBankDetails = org?.bank_name || org?.bank_iban;
  const hasNotes       = !!invoice.notes;

  if (hasBankDetails) {
    txt('BANK DETAILS,', ML, y, { size: 8, bold: true, lang: 'en' });
    y += 5;
    if (org?.bank_name) {
      txt(org.bank_name, ML, y, { size: 8, lang: 'en' });
      y += 5;
    }
    if (org?.bank_iban) {
      txt(`ACCOUNT IBAN.${org.bank_iban}`, ML, y, { size: 8, lang: 'en' });
      y += 5;
    }
    y += 3;
  }

  if (hasNotes) {
    txt(invoice.notes!, ML, y, { size: 7.5, col: '#374151', lang: 'en', maxWidth: CW });
    y += 8;
  }

  // Signature block
  y += 3;
  txt('Best Regards', ML, y, { size: 8, lang: 'en' });
  y += 5;
  if (org?.signatory_name) {
    txt(org.signatory_name, ML, y, { size: 8, bold: true, lang: 'en' });
    y += 5;
  }
  if (org?.signatory_title) {
    txt(org.signatory_title, ML, y, { size: 7.5, col: '#374151', lang: 'en' });
    y += 5;
  }
  if (org?.phone) {
    txt(org.phone, ML, y, { size: 8, lang: 'en' });
    y += 5;
  }
  if (org?.email) {
    txt(`Email- ${org.email}`, ML, y, { size: 7.5, lang: 'en' });
    y += 4.5;
  }
  if (org?.website) {
    txt(`Website- ${org.website}`, ML, y, { size: 7.5, lang: 'en' });
    y += 4.5;
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  6. UUID trace line (subtle, near bottom)
  // ══════════════════════════════════════════════════════════════════════════
  if (invoice.uuid) {
    y += 4;
    hline(y, ML, MR, '#E5E7EB', 0.15);
    y += 4;
    txt(`UUID: ${invoice.uuid}`, ML, y, { size: 5.5, col: '#9CA3AF', lang: 'en' });
  }

  doc.save(`${invoice.invoice_number}.pdf`);
}