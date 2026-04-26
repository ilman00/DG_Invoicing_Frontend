import { api } from '../lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Organization {
  id: number;
  name: string;
  name_ar: string | null;
  slug: string;
  vat_number: string;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country_code: string;
  default_currency: string;
  certificate_serial: string | null;
  csid: string | null;
  zatca_phase: 'PHASE1' | 'PHASE2';
  zatca_onboarding_status: 'NOT_STARTED' | 'PENDING' | 'COMPLETED';
  created_at: string;
  updated_at: string;
  // private_key and certificate are intentionally excluded —
  // sensitive fields that should never be sent to the frontend
}

export interface OrganizationFormValues {
  name: string;
  name_ar: string;
  slug: string;
  vat_number: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country_code: string;
  default_currency: string;
  zatca_phase: 'PHASE1' | 'PHASE2';
  zatca_onboarding_status: 'NOT_STARTED' | 'PENDING' | 'COMPLETED';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert empty strings to undefined so the backend stores NULL, not "" */
const nullCoerce = (v: string | undefined): string | undefined =>
  v === '' ? undefined : v;

// ─── API ──────────────────────────────────────────────────────────────────────

export const organizationApi = {
  /**
   * Fetch the organization that belongs to the authenticated user.
   * The backend derives organization_id from req.user — no ID needed in the URL.
   */
  get: async (): Promise<Organization> => {
    const res = await api.get<{ success: true; data: Organization }>('/organization');
    return res.data.data;
  },

  /**
   * Update the organization.
   * Maps OrganizationFormValues → UpdateOrganizationDTO.
   * slug is excluded from updates — it should not change after creation.
   * ZATCA certificate fields are read-only from the frontend.
   */
  update: async (form: OrganizationFormValues): Promise<Organization> => {
    const payload = {
      name:                    form.name,
      name_ar:                 nullCoerce(form.name_ar),
      vat_number:              form.vat_number,
      email:                   nullCoerce(form.email),
      phone:                   nullCoerce(form.phone),
      address_line1:           nullCoerce(form.address_line1),
      address_line2:           nullCoerce(form.address_line2),
      city:                    nullCoerce(form.city),
      postal_code:             nullCoerce(form.postal_code),
      country_code:            form.country_code,
      default_currency:        form.default_currency,
      zatca_phase:             form.zatca_phase,
      zatca_onboarding_status: form.zatca_onboarding_status,
    };
    const res = await api.patch<{ success: true; data: Organization }>('/organization', payload);
    return res.data.data;
  },
};