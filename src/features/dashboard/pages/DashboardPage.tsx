import { useState } from "react";

const translations = {
  en: {
    dir: "ltr",
    dashboard: "Dashboard",
    overview: "Business Overview",
    totalRevenue: "Total Revenue",
    totalInvoices: "Total Invoices",
    totalPayments: "Total Payments",
    totalCustomers: "Total Customers",
    totalItems: "Items in Catalog",
    outstanding: "Outstanding Amount",
    overdue: "Overdue Invoices",
    paidInvoices: "Paid Invoices",
    recentPayments: "Recent Payments",
    invoiceStatus: "Invoice Status",
    topItems: "Top Items",
    draft: "Draft",
    sent: "Sent",
    paid: "Paid",
    overdueLabel: "Overdue",
    searchPlaceholder: "Search...",
    viewAll: "View all",
    thisMonth: "This month",
    allTime: "All time",
    nav: {
      dashboard: "Dashboard",
      invoices: "Invoices",
      customers: "Customers",
      items: "Items",
      payments: "Payments",
      settings: "Settings",
    },
    greeting: "Good morning",
    subtitle: "Here's your business at a glance",
    paymentDate: "Payment Date",
    amount: "Amount",
    invoice: "Invoice",
    customer: "Customer",
    method: "Method",
    sar: "SAR",
  },
  ar: {
    dir: "rtl",
    dashboard: "لوحة التحكم",
    overview: "نظرة عامة على الأعمال",
    totalRevenue: "إجمالي الإيرادات",
    totalInvoices: "إجمالي الفواتير",
    totalPayments: "إجمالي المدفوعات",
    totalCustomers: "إجمالي العملاء",
    totalItems: "المنتجات في الكتالوج",
    outstanding: "المبلغ المستحق",
    overdue: "الفواتير المتأخرة",
    paidInvoices: "الفواتير المدفوعة",
    recentPayments: "المدفوعات الأخيرة",
    invoiceStatus: "حالة الفواتير",
    topItems: "أبرز المنتجات",
    draft: "مسودة",
    sent: "مُرسلة",
    paid: "مدفوعة",
    overdueLabel: "متأخرة",
    searchPlaceholder: "بحث...",
    viewAll: "عرض الكل",
    thisMonth: "هذا الشهر",
    allTime: "الكل",
    nav: {
      dashboard: "لوحة التحكم",
      invoices: "الفواتير",
      customers: "العملاء",
      items: "المنتجات",
      payments: "المدفوعات",
      settings: "الإعدادات",
    },
    greeting: "صباح الخير",
    subtitle: "إليك نظرة سريعة على أعمالك",
    paymentDate: "تاريخ الدفع",
    amount: "المبلغ",
    invoice: "فاتورة",
    customer: "العميل",
    method: "الطريقة",
    sar: "ر.س",
  },
};

const mockData = {
  stats: {
    totalRevenue: 284750.0,
    totalInvoices: 147,
    totalPayments: 98,
    totalCustomers: 34,
    totalItems: 56,
    outstanding: 62300.0,
    overdue: 8,
    paidInvoices: 89,
  },
  invoiceStatus: [
    { status: "paid", count: 89, amount: 222450 },
    { status: "sent", count: 32, amount: 62300 },
    { status: "draft", count: 18, amount: 15800 },
    { status: "overdue", count: 8, amount: 12750 },
  ],
  recentPayments: [
    { id: "INV-2025-0147", customer: "Aramco Supply Co.", amount: 18500, date: "2025-04-20", method: "bank_transfer" },
    { id: "INV-2025-0143", customer: "Al-Rashid Trading", amount: 7200, date: "2025-04-18", method: "card" },
    { id: "INV-2025-0139", customer: "Riyadh Tech Group", amount: 24000, date: "2025-04-16", method: "bank_transfer" },
    { id: "INV-2025-0134", customer: "Gulf Logistics LLC", amount: 5600, date: "2025-04-14", method: "cheque" },
    { id: "INV-2025-0128", customer: "Saudi Build Co.", amount: 11800, date: "2025-04-11", method: "cash" },
  ],
  topItems: [
    { name: "Consulting Services", name_ar: "خدمات الاستشارات", revenue: 84200, count: 38 },
    { name: "Software License", name_ar: "رخصة البرمجيات", revenue: 67500, count: 25 },
    { name: "Hardware Supply", name_ar: "توريد الأجهزة", revenue: 52300, count: 19 },
    { name: "Maintenance Contract", name_ar: "عقد الصيانة", revenue: 38900, count: 31 },
    { name: "Training Sessions", name_ar: "جلسات التدريب", revenue: 21450, count: 14 },
  ],
};

const fmt = (n) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// const StatusBadge = ({ status, t }) => {
//   const styles = {
//     paid: { bg: "#ecfdf5", color: "#059669", label: t.paid },
//     sent: { bg: "#eff6ff", color: "#2563eb", label: t.sent },
//     draft: { bg: "#f8fafc", color: "#64748b", label: t.draft },
//     overdue: { bg: "#fff1f2", color: "#e11d48", label: t.overdueLabel },
//   };
//   const s = styles[status] || styles.draft;
//   return (
//     <span style={{
//       background: s.bg, color: s.color,
//       padding: "2px 10px", borderRadius: 20,
//       fontSize: 12, fontWeight: 600, letterSpacing: "0.02em"
//     }}>{s.label}</span>
//   );
// };



const DonutChart = ({ data, t }) => {
  const total = data.reduce((s, d) => s + d.count, 0);
  const colors = { paid: "#10b981", sent: "#3b82f6", draft: "#94a3b8", overdue: "#f43f5e" };
  let cumulative = 0;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const segments = data.map(d => {
    const pct = d.count / total;
    const dash = pct * circ;
    const offset = circ - cumulative * circ;
    cumulative += pct;
    return { ...d, dash, offset };
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {segments.map((seg, i) => (
          <circle key={i} cx="70" cy="70" r={radius} fill="none"
            stroke={colors[seg.status]} strokeWidth="18"
            strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
            strokeDashoffset={seg.offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px", transition: "all 0.4s ease" }}
          />
        ))}
        <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0f172a">{total}</text>
        <text x="70" y="82" textAnchor="middle" fontSize="10" fill="#94a3b8">{t.totalInvoices.split(" ")[0]}</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: colors[d.status], flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#475569", minWidth: 60 }}>
              {t[d.status] || t.overdueLabel}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginLeft: "auto" }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function Dashboard() {
  const [lang, setLang] = useState("en");
  // const [activeNav, setActiveNav] = useState("dashboard");
  const t = translations[lang];
  const isRTL = lang === "ar";
  const { stats, invoiceStatus, recentPayments, topItems } = mockData;

  const statCards = [
    { label: t.totalRevenue, value: `${t.sar} ${fmt(stats.totalRevenue)}`, icon: "💰", color: "#3b82f6", bg: "#eff6ff", trend: "+12.4%" },
    { label: t.totalInvoices, value: stats.totalInvoices, icon: "🧾", color: "#8b5cf6", bg: "#f5f3ff", trend: "+8" },
    { label: t.totalPayments, value: stats.totalPayments, icon: "✅", color: "#10b981", bg: "#ecfdf5", trend: "+5" },
    { label: t.outstanding, value: `${t.sar} ${fmt(stats.outstanding)}`, icon: "⏳", color: "#f59e0b", bg: "#fffbeb", trend: "-3.2%" },
    { label: t.totalCustomers, value: stats.totalCustomers, icon: "👥", color: "#06b6d4", bg: "#ecfeff", trend: "+2" },
    { label: t.totalItems, value: stats.totalItems, icon: "📦", color: "#64748b", bg: "#f8fafc", trend: "—" },
  ];

  const methodLabel = (m) => ({ bank_transfer: "Bank", card: "Card", cheque: "Cheque", cash: "Cash", other: "Other" }[m] || m);

  return (
    <div style={{
      fontFamily: isRTL
        ? "'IBM Plex Sans Arabic', 'Noto Sans Arabic', Tahoma, sans-serif"
        : "'DM Sans', 'Outfit', 'Helvetica Neue', sans-serif",
      direction: t.dir,
      display: "flex",
      minHeight: "100vh",
      background: "#f8fafc",
      color: "#0f172a",
    }}>
      {/* Sidebar */}
     

      {/* Main */}
      <main style={{ flex: 1, padding: "32px 36px", overflowX: "hidden", maxWidth: "calc(100vw - 230px)" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexDirection: isRTL ? "row-reverse" : "row" }}>
          <div style={{ textAlign: isRTL ? "right" : "left" }}>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>{t.greeting}, Ahmed 👋</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.03em" }}>
              {t.dashboard}
            </h1>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{t.subtitle}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: isRTL ? "row-reverse" : "row" }}>
            {/* Lang toggle */}
            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 8, padding: 3 }}>
              {["en", "ar"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: "5px 14px", borderRadius: 6, border: "none",
                  background: lang === l ? "#fff" : "transparent",
                  color: lang === l ? "#2563eb" : "#94a3b8",
                  fontWeight: lang === l ? 700 : 400,
                  fontSize: 12, cursor: "pointer",
                  boxShadow: lang === l ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}>{l === "en" ? "EN" : "عربي"}</button>
              ))}
            </div>

            {/* Date */}
            <div style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
              padding: "8px 16px", fontSize: 13, color: "#475569", fontWeight: 500,
            }}>
              {new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 18,
          marginBottom: 28,
        }}>
          {statCards.map((card, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 16,
              padding: "22px 24px",
              border: "1px solid #f1f5f9",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Accent blob */}
              <div style={{
                position: "absolute",
                top: -20, right: isRTL ? "auto" : -20, left: isRTL ? -20 : "auto",
                width: 80, height: 80, borderRadius: "50%",
                background: card.bg, opacity: 0.8,
              }} />

              <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexDirection: isRTL ? "row-reverse" : "row" }}>
                <div style={{ textAlign: isRTL ? "right" : "left" }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {card.value}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 12, color: card.trend.startsWith("+") ? "#10b981" : card.trend === "—" ? "#94a3b8" : "#f43f5e", fontWeight: 600 }}>
                    {card.trend} {card.trend !== "—" && <span style={{ color: "#94a3b8", fontWeight: 400 }}>{lang === "ar" ? "هذا الشهر" : "this month"}</span>}
                  </div>
                </div>
                <div style={{
                  width: 42, height: 42, borderRadius: 12,
                  background: card.bg, display: "flex",
                  alignItems: "center", justifyContent: "center", fontSize: 20,
                }}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row: Donut + Recent Payments */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 20, marginBottom: 20 }}>
          {/* Invoice Status */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 20, textAlign: isRTL ? "right" : "left" }}>
              {t.invoiceStatus}
            </div>
            <DonutChart data={invoiceStatus} t={t} />
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
              {invoiceStatus.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, flexDirection: isRTL ? "row-reverse" : "row" }}>
                  <span style={{ fontSize: 12, color: "#64748b" }}>{t[d.status] || t.overdueLabel}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{t.sar} {fmt(d.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexDirection: isRTL ? "row-reverse" : "row" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{t.recentPayments}</div>
              <button style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>{t.viewAll} →</button>
            </div>

            {/* Table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1.5fr 1fr 0.8fr",
              gap: 8,
              padding: "0 8px 10px",
              borderBottom: "1px solid #f1f5f9",
              fontSize: 11,
              fontWeight: 600,
              color: "#94a3b8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              direction: t.dir,
            }}>
              <span>{t.invoice}</span>
              <span>{t.customer}</span>
              <span style={{ textAlign: "right" }}>{t.amount}</span>
              <span style={{ textAlign: "right" }}>{t.method}</span>
            </div>

            {recentPayments.map((p, i) => (
              <div key={i} style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1.5fr 1fr 0.8fr",
                gap: 8,
                padding: "12px 8px",
                borderBottom: i < recentPayments.length - 1 ? "1px solid #f8fafc" : "none",
                alignItems: "center",
                direction: t.dir,
                transition: "background 0.1s",
              }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#2563eb" }}>{p.id}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{p.date}</div>
                </div>
                <div style={{ fontSize: 13, color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.customer}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#10b981", textAlign: "right" }}>
                  {t.sar} {fmt(p.amount)}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: "#475569",
                    background: "#f1f5f9", borderRadius: 6, padding: "3px 8px"
                  }}>{methodLabel(p.method)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Items */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexDirection: isRTL ? "row-reverse" : "row" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{t.topItems}</div>
            <button style={{ fontSize: 12, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>{t.viewAll} →</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {topItems.map((item, i) => {
              const maxRevenue = topItems[0].revenue;
              const pct = (item.revenue / maxRevenue) * 100;
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, flexDirection: isRTL ? "row-reverse" : "row" }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `hsl(${220 + i * 15}, 80%, ${95 - i * 2}%)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800, color: `hsl(${220 + i * 15}, 60%, 40%)`,
                    flexShrink: 0,
                  }}>{i + 1}</div>

                  <div style={{ flex: 1, textAlign: isRTL ? "right" : "left" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, flexDirection: isRTL ? "row-reverse" : "row" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                        {isRTL ? item.name_ar : item.name}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                        {t.sar} {fmt(item.revenue)}
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${pct}%`,
                        background: `linear-gradient(90deg, hsl(${220 + i * 15}, 70%, 55%), hsl(${220 + i * 15}, 80%, 65%))`,
                        borderRadius: 99,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                      {item.count} {lang === "ar" ? "فاتورة" : "invoices"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        button { font-family: inherit; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
      `}</style>
    </div>
  );
}