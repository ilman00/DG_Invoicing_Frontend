import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { InvoiceWithDetails } from '../types/invoice.types';

const BRAND   = '#2563EB'; // blue-600
const MUTED   = '#64748B'; // slate-500
const DARK    = '#0F172A'; // slate-900
const BORDER  = '#E2E8F0'; // slate-200
const GREEN   = '#059669'; // emerald-600

export async function generateInvoicePdf(invoice: InvoiceWithDetails): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; // A4 width mm
  const margin = 14;
  let y = 0;

  // ── helpers ──────────────────────────────────────────────────────────────
  const hex2rgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const setColor = (hex: string, type: 'fill' | 'text' | 'draw' = 'text') => {
    const { r, g, b } = hex2rgb(hex);
    if (type === 'fill') doc.setFillColor(r, g, b);
    else if (type === 'draw') doc.setDrawColor(r, g, b);
    else doc.setTextColor(r, g, b);
  };

  const text = (
    str: string,
    x: number,
    yPos: number,
    opts?: { size?: number; bold?: boolean; color?: string; align?: 'left' | 'right' | 'center' }
  ) => {
    doc.setFontSize(opts?.size ?? 9);
    doc.setFont('helvetica', opts?.bold ? 'bold' : 'normal');
    setColor(opts?.color ?? DARK);
    doc.text(str, x, yPos, { align: opts?.align ?? 'left' });
  };

  const line = (yPos: number, color = BORDER) => {
    setColor(color, 'draw');
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, W - margin, yPos);
  };

  // ── Header bar ────────────────────────────────────────────────────────────
  const { r: br, g: bg, b: bb } = hex2rgb(BRAND);
  doc.setFillColor(br, bg, bb);
  doc.rect(0, 0, W, 28, 'F');

  text('TAX INVOICE', margin, 11, { size: 15, bold: true, color: '#FFFFFF' });
  text('ZATCA Compliant', margin, 17, { size: 8, color: '#BFDBFE' });

  // Invoice number + status pill
  text(invoice.invoice_number, W - margin, 11, { size: 12, bold: true, color: '#FFFFFF', align: 'right' });
  const statusLabel = invoice.status.toUpperCase();
  text(statusLabel, W - margin, 17, { size: 7, color: '#BFDBFE', align: 'right' });

  y = 36;

  // ── Org / Seller info ─────────────────────────────────────────────────────
  text('From', margin, y, { size: 7, color: MUTED });
  text('To', W / 2 + 2, y, { size: 7, color: MUTED });
  y += 5;

  // Seller (org info isn't in InvoiceWithDetails but we print placeholders)
  text('Your Organization', margin, y, { bold: true, size: 10 });
  text(invoice.customer_name, W / 2 + 2, y, { bold: true, size: 10 });
  y += 5;
  text(invoice.customer_email, W / 2 + 2, y, { size: 8, color: MUTED });

  y += 10;
  line(y);
  y += 7;

  // ── Dates row ─────────────────────────────────────────────────────────────
  const dateFields = [
    { label: 'Issue Date', value: invoice.issue_date },
    { label: 'Due Date',   value: invoice.due_date },
    { label: 'Type',       value: invoice.invoice_type === 'simplified' ? 'Simplified' : 'Standard' },
    { label: 'Currency',   value: invoice.currency_code },
  ];

  dateFields.forEach((f, i) => {
    const x = margin + i * 46;
    text(f.label, x, y, { size: 7, color: MUTED });
    text(f.value, x, y + 5, { size: 9, bold: true });
  });

  y += 14;
  line(y);
  y += 8;

  // ── Line items table ──────────────────────────────────────────────────────
  const cols = { name: margin, qty: 100, price: 122, vat: 148, total: 170 };

  // Table header
  setColor('#F8FAFC', 'fill');
  doc.rect(margin, y - 4, W - margin * 2, 8, 'F');

  text('#',            margin,    y, { size: 7.5, bold: true, color: MUTED });
  text('Description',  margin + 6, y, { size: 7.5, bold: true, color: MUTED });
  text('Qty',          cols.qty,  y, { size: 7.5, bold: true, color: MUTED });
  text('Unit Price',   cols.price, y, { size: 7.5, bold: true, color: MUTED });
  text('VAT %',        cols.vat,  y, { size: 7.5, bold: true, color: MUTED });
  text('Line Total',   W - margin, y, { size: 7.5, bold: true, color: MUTED, align: 'right' });

  y += 7;
  line(y);
  y += 5;

  // Rows
  invoice.line_items.forEach((li, idx) => {
    if (y > 240) { doc.addPage(); y = 20; }

    text(String(idx + 1),           margin,       y, { size: 8, color: MUTED });
    text(li.item_name,               margin + 6,   y, { size: 8 });
    text(String(li.quantity),        cols.qty,     y, { size: 8 });
    text(Number(li.unit_price).toFixed(2), cols.price, y, { size: 8 });
    text(`${Number(li.vat_rate).toFixed(0)}%`, cols.vat, y, { size: 8 });
    text(
      `${invoice.currency_code} ${Number(li.line_total_incl_vat).toFixed(2)}`,
      W - margin, y, { size: 8, align: 'right' }
    );

    y += 6;
    setColor(BORDER, 'draw');
    doc.setLineWidth(0.1);
    doc.line(margin, y - 1, W - margin, y - 1);
  });

  y += 4;

  // ── Totals block ──────────────────────────────────────────────────────────
  const totalsX = 130;
  const valX    = W - margin;

  const totalsRows = [
    { label: 'Subtotal (excl. VAT)', value: Number(invoice.subtotal_amount).toFixed(2) },
    { label: 'VAT',                  value: Number(invoice.vat_total).toFixed(2) },
  ];

  totalsRows.forEach((row) => {
    text(row.label, totalsX, y, { size: 8, color: MUTED });
    text(`${invoice.currency_code} ${row.value}`, valX, y, { size: 8, align: 'right' });
    y += 6;
  });

  line(y);
  y += 6;

  text('Grand Total', totalsX, y, { size: 10, bold: true });
  text(
    `${invoice.currency_code} ${Number(invoice.grand_total).toFixed(2)}`,
    valX, y, { size: 10, bold: true, color: BRAND, align: 'right' }
  );

  y += 14;

  // ── QR Code ───────────────────────────────────────────────────────────────
  if (invoice.qr_code) {
    try {
      // invoice.qr_code is a base64-encoded TLV string from ZATCA utility.
      // We use it as the QR data content.
      const qrDataUrl = await QRCode.toDataURL(invoice.qr_code, {
        width: 200,
        margin: 1,
        color: { dark: '#000000', light: '#FFFFFF' },
      });

      const qrSize = 32;
      const qrX = margin;

      // Label
      text('ZATCA QR Code', qrX, y, { size: 7, color: MUTED });
      y += 3;
      doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize);

      // Notes alongside QR
      if (invoice.notes) {
        text('Notes', qrX + qrSize + 8, y + 3, { size: 7, color: MUTED });
        const noteLines = doc.splitTextToSize(invoice.notes, 90);
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(noteLines, qrX + qrSize + 8, y + 9);
      }

      y += qrSize + 6;
    } catch {
      // If QR fails, continue without it
    }
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = 287;
  const { r: gr, g: gg, b: gb } = hex2rgb(GREEN);
  doc.setFillColor(gr, gg, gb);
  doc.rect(0, footerY - 5, W, 10, 'F');

  text(
    'This is a ZATCA-compliant electronic invoice',
    W / 2, footerY,
    { size: 7.5, bold: true, color: '#FFFFFF', align: 'center' }
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  doc.save(`${invoice.invoice_number}.pdf`);
}