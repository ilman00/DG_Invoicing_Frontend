
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import QRCode from 'qrcode';
import { X, Printer } from 'lucide-react';
import type { InvoiceWithDetails } from '../../../types/invoice.types';



export interface OrgInfo {
    name: string;
    name_ar?: string | null;
    vat_number: string;
    address_line1?: string | null;
    city?: string | null;
    email?: string | null;
    phone?: string | null;
}

interface Props {
  invoice: InvoiceWithDetails;
  onClose: () => void;
}

const fmt = (n: number | string) => Number(n).toFixed(2);

const STATUS_STYLES: Record<InvoiceWithDetails['status'], { bg: string; label: string }> = {
    draft: { bg: '#64748B', label: 'Draft' },
    sent: { bg: '#2563EB', label: 'Sent' },
    paid: { bg: '#059669', label: 'Paid' },
    overdue: { bg: '#DC2626', label: 'Overdue' },
};

function getPortalRoot(): HTMLElement {
    let el = document.getElementById('invoice-print-portal');
    if (!el) {
        el = document.createElement('div');
        el.id = 'invoice-print-portal';
        document.body.appendChild(el);
    }
    return el;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InvoicePreview({ invoice,  onClose }: Props) {
    const qrCanvasRef = useRef<HTMLCanvasElement>(null);


    useEffect(() => {
        if (!qrCanvasRef.current || !invoice.qr_code) return;
        QRCode.toCanvas(qrCanvasRef.current, invoice.qr_code, {
            width: 96, margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
        }).catch((err) => console.error('[InvoicePreview] QR render failed:', err));
    }, [invoice.qr_code]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const status = STATUS_STYLES[invoice.status];
    const defaultVatRate = invoice.line_items[0]?.vat_rate ?? 15;

    const modal = (
        <div
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                backgroundColor: 'rgba(15,23,42,0.65)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                overflowY: 'auto', padding: '24px 16px 48px',
            }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >

            {/* Toolbar — hidden on print by InvoicePrintStyles */}
            <div
                className="no-print"
                style={{
                    width: '100%', maxWidth: 794,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 12,
                }}
            >
                <span style={{ color: '#94A3B8', fontSize: 13 }}>
                    Invoice Preview · {invoice.invoice_number}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => window.print()}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '7px 16px', background: '#1D4ED8', color: '#fff',
                            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                        }}
                    >
                        <Printer size={14} />
                        Print / Save PDF
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: 34, height: 34, background: 'rgba(255,255,255,0.1)',
                            border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer',
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Invoice card — id targeted by print CSS */}
            <div
                id="invoice-printable"
                style={{
                    width: '100%', maxWidth: 794,
                    background: '#fff', color: '#0F172A',
                    borderRadius: 10, overflow: 'hidden',
                    boxShadow: '0 4px 32px rgba(0,0,0,0.18)',
                    fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13,
                }}
            >

                {/* Header */}
                <div style={{
                    background: '#1D4ED8', padding: '22px 32px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>
                            TAX INVOICE
                        </div>
                        <div style={{ fontSize: 11, color: '#BFDBFE', marginTop: 4 }}>
                            ZATCA Compliant · {invoice.invoice_type === 'simplified' ? 'Simplified' : 'Standard'} Invoice
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                            {invoice.invoice_number}
                        </div>
                        <span style={{
                            display: 'inline-block', marginTop: 5,
                            padding: '2px 12px', borderRadius: 999,
                            background: status.bg, color: '#fff',
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                            textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.25)',
                        }}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Seller / Buyer */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '0.5px solid #E2E8F0' }}>
                    <div style={{ padding: '18px 32px', borderRight: '0.5px solid #E2E8F0' }}>
                        <SectionLabel>From (Seller)</SectionLabel>
                        <PartyName>{invoice.org.name}</PartyName>
                        {invoice.org.name_ar && <Detail>{invoice.org.name_ar}</Detail>}
                        <Detail>VAT: {invoice.org.vat_number}</Detail>
                        {invoice.org.address_line1 && <Detail>{invoice.org.address_line1}{invoice.org.city ? `, ${invoice.org.city}` : ''}</Detail>}
                        {invoice.org.email && <Detail>{invoice.org.email}</Detail>}
                        {invoice.org.phone && <Detail>{invoice.org.phone}</Detail>}
                    </div>

                    {/* Buyer — only customer_name and customer_email exist on InvoiceWithDetails */}
                    <div style={{ padding: '18px 32px' }}>
                        <SectionLabel>To (Buyer)</SectionLabel>
                        <PartyName>{invoice.customer_name}</PartyName>
                        <Detail>{invoice.customer_email}</Detail>
                    </div>
                </div>

                {/* Meta strip */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    background: '#F8FAFC', borderBottom: '0.5px solid #E2E8F0',
                }}>
                    {[
                        { label: 'Issue Date', value: invoice.issue_date },
                        { label: 'Due Date', value: invoice.due_date },
                        { label: 'Invoice Type', value: invoice.invoice_type === 'simplified' ? 'Simplified' : 'Standard' },
                        { label: 'Currency', value: invoice.currency_code },
                    ].map((item, i, arr) => (
                        <div key={item.label} style={{
                            padding: '12px 24px',
                            borderRight: i < arr.length - 1 ? '0.5px solid #E2E8F0' : 'none',
                        }}>
                            <SectionLabel>{item.label}</SectionLabel>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginTop: 3 }}>
                                {item.value}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Line items */}
                <div style={{ padding: '0 16px 4px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC' }}>
                                <Th style={{ width: 28 }}>#</Th>
                                <Th style={{ textAlign: 'left' }}>Description</Th>
                                <Th>Qty</Th>
                                <Th>Unit Price</Th>
                                <Th>VAT %</Th>
                                <Th>Excl. VAT</Th>
                                <Th>Total (incl. VAT)</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.line_items.map((li, idx) => (
                                <tr key={li.id ?? idx} style={{ borderBottom: '0.5px solid #F1F5F9' }}>
                                    <Td style={{ color: '#94A3B8', fontSize: 11 }}>{idx + 1}</Td>
                                    <Td style={{ fontWeight: 500, color: '#0F172A', textAlign: 'left' }}>
                                        {li.item_name}
                                        {li.item_name_ar && (
                                            <span style={{ display: 'block', fontSize: 10, color: '#94A3B8', direction: 'rtl' }}>
                                                {li.item_name_ar}
                                            </span>
                                        )}
                                    </Td>
                                    <Td>{li.quantity}</Td>
                                    <Td>{fmt(li.unit_price)}</Td>
                                    <Td>{fmt(li.vat_rate)}%</Td>
                                    <Td>{fmt(li.line_total_excl_vat)}</Td>
                                    <Td style={{ fontWeight: 600, color: '#0F172A' }}>
                                        {invoice.currency_code} {fmt(li.line_total_incl_vat)}
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* QR + Totals */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '1fr auto',
                    gap: 32, padding: '20px 32px 24px',
                    borderTop: '0.5px solid #E2E8F0', alignItems: 'start',
                }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div>
                            <SectionLabel style={{ marginBottom: 6 }}>ZATCA QR Code</SectionLabel>
                            {invoice.qr_code ? (
                                <canvas
                                    ref={qrCanvasRef}
                                    style={{ display: 'block', border: '0.5px solid #E2E8F0', borderRadius: 4 }}
                                />
                            ) : (
                                <div style={{
                                    width: 96, height: 96, background: '#F1F5F9', borderRadius: 4,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 10, color: '#94A3B8',
                                }}>No QR data</div>
                            )}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.8, paddingTop: 20 }}>
                            <div><strong style={{ color: '#334155' }}>Seller:</strong> {invoice.org.name}</div>
                            <div><strong style={{ color: '#334155' }}>VAT No:</strong> {invoice.org.vat_number}</div>
                            <div><strong style={{ color: '#334155' }}>Total:</strong> {invoice.currency_code} {fmt(invoice.grand_total)}</div>
                            <div><strong style={{ color: '#334155' }}>VAT:</strong> {invoice.currency_code} {fmt(invoice.vat_total)}</div>
                            <div style={{ marginTop: 6, fontSize: 9, color: '#94A3B8' }}>Scan to verify with ZATCA</div>
                        </div>
                    </div>

                    <div style={{ minWidth: 230 }}>
                        <TotalRow label="Subtotal (excl. VAT)">
                            {invoice.currency_code} {fmt(invoice.subtotal_amount)}
                        </TotalRow>
                        <TotalRow label={`VAT (${fmt(defaultVatRate)}%)`}>
                            {invoice.currency_code} {fmt(invoice.vat_total)}
                        </TotalRow>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            borderTop: '1.5px solid #1D4ED8', marginTop: 8, paddingTop: 10,
                            fontSize: 16, fontWeight: 700, color: '#0F172A',
                        }}>
                            <span>Grand Total</span>
                            <span style={{ color: '#1D4ED8' }}>{invoice.currency_code} {fmt(invoice.grand_total)}</span>
                        </div>
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div style={{ padding: '0 32px 20px' }}>
                        <SectionLabel style={{ marginBottom: 4 }}>Notes</SectionLabel>
                        <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>{invoice.notes}</div>
                    </div>
                )}

                {/* Footer bar */}
                <div style={{
                    background: '#059669', color: '#fff',
                    textAlign: 'center', padding: '9px 16px',
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.05em',
                }}>
                    This is a ZATCA-compliant electronic invoice · {invoice.org.name} · VAT {invoice.org.vat_number}
                </div>

            </div>
        </div>
    );

    return createPortal(modal, getPortalRoot());
}

// ─── Style helpers ────────────────────────────────────────────────────────────

function SectionLabel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94A3B8', ...style }}>
            {children}
        </div>
    );
}

function PartyName({ children }: { children: React.ReactNode }) {
    return <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginTop: 5 }}>{children}</div>;
}

function Detail({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, lineHeight: 1.5, ...style }}>{children}</div>;
}

function Th({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <th style={{
            padding: '9px 12px', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em',
            color: '#94A3B8', textAlign: 'right',
            borderBottom: '0.5px solid #E2E8F0', whiteSpace: 'nowrap', ...style,
        }}>
            {children}
        </th>
    );
}

function Td({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <td style={{ padding: '10px 12px', fontSize: 12, color: '#334155', textAlign: 'right', ...style }}>
            {children}
        </td>
    );
}

function TotalRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24, padding: '4px 0', fontSize: 12, color: '#64748B' }}>
            <span>{label}</span>
            <span style={{ fontWeight: 500, color: '#334155' }}>{children}</span>
        </div>
    );
}