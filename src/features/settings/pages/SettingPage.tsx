import { useState } from "react";
import {
  Building2,
  Receipt,
  Banknote,
  Settings,
  User,
  Save,
  ChevronRight,
  Globe,
  Phone,
  Mail,
  MapPin,
  Hash,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";


// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "sales", label: "Sales Settings", icon: Receipt, disabled: true },
  { id: "expenses", label: "Expenses", icon: Banknote, disabled: true },
  { id: "bank", label: "Bank Settings", icon: Settings, disabled: true },
  { id: "users", label: "User Settings", icon: User, disabled: true },
];

const CURRENCIES = ["SAR", "USD", "PKR", "EUR", "GBP", "AED"];
const COUNTRIES = [
  { code: "SA", label: "Saudi Arabia" },
  { code: "US", label: "United States" },
  { code: "PK", label: "Pakistan" },
  { code: "AE", label: "United Arab Emirates" },
  { code: "GB", label: "United Kingdom" },
];
const ZATCA_PHASES = ["PHASE1", "PHASE2"];
const ZATCA_STATUSES = ["NOT_STARTED", "PENDING", "COMPLETED"];

// ─── Field components ─────────────────────────────────────────────────────────
function Field({ label, hint = undefined, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      {...props}
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      {...props}
    >
      {children}
    </select>
  );
}

// ─── ZATCA status badge ───────────────────────────────────────────────────────
function ZatcaBadge({ status }) {
  const map = {
    NOT_STARTED: { color: "bg-gray-100 text-gray-600", label: "Not Started" },
    PENDING: { color: "bg-amber-50 text-amber-600", label: "Pending" },
    COMPLETED: { color: "bg-green-50 text-green-600", label: "Completed" },
  };
  const s = map[status] ?? map["NOT_STARTED"];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.color}`}
    >
      {status === "COMPLETED" ? (
        <BadgeCheck className="w-3.5 h-3.5" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5" />
      )}
      {s.label}
    </span>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, description, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {children}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("organization");
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    name: "",
    name_ar: "",
    slug: "",
    vat_number: "",
    email: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    country_code: "SA",
    default_currency: "SAR",
    zatca_phase: "PHASE1",
    zatca_onboarding_status: "NOT_STARTED",
  });

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: call PATCH /api/organizations/:id
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-100 px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage your organization and account preferences
        </p>
      </div>

      <div className="flex gap-6 p-8 max-w-6xl mx-auto">
        {/* ── Left nav ── */}
        <aside className="w-56 shrink-0">
          <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => !item.disabled && setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 text-sm transition border-b border-gray-50 last:border-0
                    ${
                      active
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : item.disabled
                        ? "text-gray-300 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </span>
                  {item.disabled ? (
                    <span className="text-[10px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-medium">
                      Soon
                    </span>
                  ) : active ? (
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 min-w-0">
          {activeTab === "organization" && (
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              {/* General */}
              <Section
                title="General Information"
                description="Basic details about your organization"
              >
                <Field label="Organization Name (English)">
                  <Input
                    placeholder="e.g. Acme Corp"
                    value={form.name}
                    onChange={set("name")}
                    required
                  />
                </Field>
                <Field label="Organization Name (Arabic)">
                  <Input
                    placeholder="الاسم بالعربية"
                    dir="rtl"
                    value={form.name_ar}
                    onChange={set("name_ar")}
                  />
                </Field>
                <Field
                  label="Slug"
                  hint="Used in URLs. Lowercase, no spaces."
                >
                  <Input
                    placeholder="acme-corp"
                    value={form.slug}
                    onChange={set("slug")}
                    required
                  />
                </Field>
                <Field label="VAT Number">
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      className="pl-9 w-full h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="300xxxxxxxxxx"
                      value={form.vat_number}
                      onChange={set("vat_number")}
                      required
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
              </Section>

              {/* Contact */}
              <Section
                title="Contact Details"
                description="How customers and partners can reach you"
              >
                <Field label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="hello@company.com"
                      value={form.email}
                      onChange={set("email")}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
                <Field label="Phone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder="+966 5x xxx xxxx"
                      value={form.phone}
                      onChange={set("phone")}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
              </Section>

              {/* Address */}
              <Section
                title="Address"
                description="Appears on invoices and official documents"
              >
                <Field label="Address Line 1">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      placeholder="Street address"
                      value={form.address_line1}
                      onChange={set("address_line1")}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      style={{ paddingLeft: "2.25rem" }}
                    />
                  </div>
                </Field>
                <Field label="Address Line 2">
                  <Input
                    placeholder="Suite, floor, building (optional)"
                    value={form.address_line2}
                    onChange={set("address_line2")}
                  />
                </Field>
                <Field label="City">
                  <Input
                    placeholder="Riyadh"
                    value={form.city}
                    onChange={set("city")}
                  />
                </Field>
                <Field label="Postal Code">
                  <Input
                    placeholder="12345"
                    value={form.postal_code}
                    onChange={set("postal_code")}
                  />
                </Field>
                <Field label="Country">
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={form.country_code}
                      onChange={set("country_code")}
                      className="h-9 w-full rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      style={{ paddingLeft: "2.25rem" }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
                <Field label="Default Currency">
                  <Select
                    value={form.default_currency}
                    onChange={set("default_currency")}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>
              </Section>

              {/* ZATCA */}
              <Section
                title="ZATCA Compliance"
                description="Saudi e-invoicing integration settings"
              >
                <Field label="ZATCA Phase">
                  <Select
                    value={form.zatca_phase}
                    onChange={set("zatca_phase")}
                  >
                    {ZATCA_PHASES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Onboarding Status">
                  <div className="flex items-center gap-3">
                    <Select
                      value={form.zatca_onboarding_status}
                      onChange={set("zatca_onboarding_status")}
                      className="flex-1"
                    >
                      {ZATCA_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace("_", " ")}
                        </option>
                      ))}
                    </Select>
                    <ZatcaBadge status={form.zatca_onboarding_status} />
                  </div>
                </Field>

                {/* Certificate fields — read-only display */}
                <Field
                  label="Certificate Serial"
                  hint="Auto-populated after ZATCA onboarding"
                >
                  <Input
                    placeholder="—"
                    disabled
                    className="bg-gray-50 text-gray-400"
                  />
                </Field>
                <Field
                  label="CSID"
                  hint="Cryptographic stamp identifier from ZATCA"
                >
                  <Input
                    placeholder="—"
                    disabled
                    className="bg-gray-50 text-gray-400"
                  />
                </Field>
              </Section>

              {/* Save bar */}
              <div className="flex items-center justify-end gap-3 py-2">
                {saved && (
                  <span className="text-sm text-green-600 flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4" />
                    Changes saved
                  </span>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}