// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  userId: number;
  email: string;
  organizationId: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  organizationName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export type CustomerType   = 'individual' | 'business';
export type CustomerStatus = 'active' | 'inactive' | 'blocked';

// ─── Entity ───────────────────────────────────────────────────────────────────

export interface Customer {
  id:               number;
  organization_id:  number;
  name:             string;
  name_ar:          string | null;
  email:            string;
  phone:            string | null;
  notes:            string | null;
  vat_number:       string | null;
  address_line1:    string | null;
  building_number:  string | null;
  district:         string | null;
  city:             string | null;
  postal_code:      string | null;
  country_code:     string;           // defaults to 'SA'
  opening_balance:  number;           // decimal stored as number
  type:             CustomerType;
  status:           CustomerStatus;
  created_by:       number | null;
  updated_by:       number | null;
  created_at:       string;           // ISO timestamp string from MySQL
  updated_at:       string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

/**
 * Sent by the frontend on POST /customers.
 * organizationId and userId are injected by the backend from req.user —
 * never include them here.
 */
export interface CreateCustomerDTO {
  name:             string;
  email:            string;
  type:             CustomerType;     // required — backend needs it to validate VAT
  name_ar?:         string;
  phone?:           string;
  notes?:           string;
  vat_number?:      string;           // required when type === 'business'
  address_line1?:   string;
  building_number?: string;
  district?:        string;
  city?:            string;
  postal_code?:     string;
  country_code?:    string;           // defaults to 'SA' on the backend
  opening_balance?: number;           // defaults to 0 on the backend
  status?:          CustomerStatus;   // defaults to 'active' on the backend
}

/**
 * Sent by the frontend on PUT /customers/:id.
 * Every field is optional — only changed fields need to be included.
 */
export interface UpdateCustomerDTO {
  name?:            string;
  name_ar?:         string;
  email?:           string;
  phone?:           string;
  notes?:           string;
  vat_number?:      string;
  address_line1?:   string;
  building_number?: string;
  district?:        string;
  city?:            string;
  postal_code?:     string;
  country_code?:    string;
  opening_balance?: number;
  type?:            CustomerType;
  status?:          CustomerStatus;
}

// ─── Item ────────────────────────────────────────────────────────────────────

export interface Item {
  id: number;
  organization_id: number;
  name: string;
  name_ar: string | null;
  price: number;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateItemDTO {
  name: string;
  name_ar?: string;
  price: number;
}

export interface UpdateItemDTO extends Partial<CreateItemDTO> {}


// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
