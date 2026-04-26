import type { InvoiceStatusItem, Translation } from "../pages/DashboardPage";

type Props = {
  data: InvoiceStatusItem[];
  t: Translation;
};

type Segment = {
  status: InvoiceStatusItem["status"];
  value: number;
  dash: string;
};

export const DonutChart = ({ data, t }: Props) => {
  const total = data.reduce((s: number, d: InvoiceStatusItem) => s + d.count, 0);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  const colors: Record<InvoiceStatusItem["status"], string> = {
    paid: "#10b981",
    sent: "#3b82f6",
    draft: "#64748b",
    overdue: "#ef4444",
  };

  let cumulative = 0;

  const segments: Segment[] = data.map((d) => {
    const value = d.count / total;
    const dash = `${value * circumference} ${circumference}`;
    const seg = {
      status: d.status,
      value,
      dash,
    };
    cumulative += value;
    return seg;
  });

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <g transform="rotate(-90 70 70)">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="70"
              cy="70"
              r={radius}
              fill="transparent"
              stroke={colors[seg.status]}
              strokeWidth="18"
              strokeDasharray={seg.dash}
              strokeDashoffset={-i * 10} // simple offset
            />
          ))}
        </g>
      </svg>

      <div>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: colors[d.status],
              }}
            />
            <span style={{ fontSize: 12 }}>
              {t[d.status]} ({d.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};