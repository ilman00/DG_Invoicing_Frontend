// ─── Enums / Unions ──────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type InvoiceType   = 'standard' | 'simplified';

// ─── DB Row Shapes ────────────────────────────────────────────────────────────

export interface InvoiceLineItem {
  id:                  number;
  invoice_id:          number;
  item_id:             number | null;
  item_name:           string;
  item_name_ar:        string | null;
  quantity:            number;
  unit_price:          number;
  vat_rate:            number;   // e.g. 15.00
  vat_amount:          number;
  line_total:          number;   // backward-compat alias for line_total_incl_vat
  line_total_excl_vat: number;
  line_total_incl_vat: number;
}

export interface Invoice {
  id:                    number;
  organization_id:       number;
  customer_id:           number;
  invoice_number:        string;
  invoice_type:          InvoiceType;
  issue_date:            string;        // YYYY-MM-DD
  issue_datetime:        string | null; // ISO-8601 datetime
  due_date:              string;        // YYYY-MM-DD
  total_amount:          number;        // backward-compat alias for grand_total
  subtotal_amount:       number;        // sum of line_total_excl_vat
  vat_total:             number;        // sum of vat_amount
  grand_total:           number;        // subtotal + vat
  currency_code:         string;        // e.g. 'SAR'
  exchange_rate:         number;        // default 1.0
  status:                InvoiceStatus;
  notes:                 string | null;
  // ZATCA cryptographic fields
  uuid:                  string | null;
  invoice_hash:          string | null;
  previous_invoice_hash: string | null;
  qr_code:               string | null;
  // debit / credit note support
  reference_invoice_id:  number | null;
  // audit
  created_by:            number | null;
  updated_by:            number | null;
  created_at:            string;        // ISO-8601
  updated_at:            string;        // ISO-8601
}

export interface InvoiceWithDetails extends Invoice {
  customer_name:  string;
  customer_email: string;
  line_items:     InvoiceLineItem[];
}

// ─── DTOs (mirror backend) ────────────────────────────────────────────────────

export interface CreateLineItemDTO {
  item_id?:      number;
  item_name:     string;
  item_name_ar?: string;
  quantity:      number;
  unit_price:    number;
  vat_rate?:     number;   // defaults to 15 on the backend
}

export interface CreateInvoiceDTO {
  customer_id:           number;
  invoice_type?:         InvoiceType;   // defaults to 'simplified'
  currency_code?:        string;        // defaults to org default ('SAR')
  exchange_rate?:        number;        // defaults to 1
  issue_date:            string;        // YYYY-MM-DD
  due_date:              string;        // YYYY-MM-DD
  notes?:                string;
  reference_invoice_id?: number;        // for debit / credit notes
  line_items:            CreateLineItemDTO[];
}

export interface UpdateInvoiceDTO {
  issue_date?: string;
  due_date?:   string;
  notes?:      string;
  status?:     InvoiceStatus;
}