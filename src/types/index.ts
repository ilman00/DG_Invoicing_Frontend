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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export type CustomerType = 'individual' | 'business';
export type CustomerStatus = 'active' | 'inactive' | 'blocked';

export interface Customer {
  id: number;
  organization_id: number;
  name: string;
  name_ar: string | null;
  email: string;
  phone: string | null;
  type: CustomerType;
  status: CustomerStatus;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerDTO {
  name: string;
  name_ar?: string;
  email: string;
  phone?: string;
  type?: CustomerType;
  status?: CustomerStatus;
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> {}

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

// ─── Invoice ─────────────────────────────────────────────────────────────────





export interface CreateLineItemDTO {
  item_id?: number;
  item_name: string;
  item_name_ar?: string;
  quantity: number;
  unit_price: number;
}

export interface CreateInvoiceDTO {
  customer_id: number;
  issue_date: string;
  due_date: string;
  notes?: string;
  line_items: CreateLineItemDTO[];
}


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
