/**
 * Lightweight SVG trend chart (no chart library). Values are illustrative.
 */
export function PerformanceChart() {
  const w = 320;
  const h = 120;
  const pad = 8;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const thisMonth = [0.35, 0.42, 0.38, 0.55, 0.5, 0.62, 0.58];
  const lastMonth = [0.4, 0.36, 0.44, 0.4, 0.48, 0.45, 0.52];

  function lineY(norm: number): number {
    return pad + innerH * (1 - norm);
  }

  function lineX(i: number, len: number): number {
    return pad + (innerW * i) / Math.max(len - 1, 1);
  }

  const dThis = thisMonth
    .map((v, i) => `${i === 0 ? "M" : "L"} ${lineX(i, thisMonth.length)} ${lineY(v)}`)
    .join(" ");
  const dLast = lastMonth
    .map((v, i) => `${i === 0 ? "M" : "L"} ${lineX(i, lastMonth.length)} ${lineY(v)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-36 w-full max-w-full text-foreground"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="chartFillThis" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="oklch(0.488 0.243 264.376)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={pad}
          x2={w - pad}
          y1={pad + innerH * t}
          y2={pad + innerH * t}
          className="stroke-border"
          strokeWidth={1}
          strokeDasharray="4 6"
        />
      ))}
      <path
        d={`${dThis} L ${lineX(thisMonth.length - 1, thisMonth.length)} ${h - pad} L ${pad} ${h - pad} Z`}
        fill="url(#chartFillThis)"
      />
      <path d={dLast} fill="none" className="stroke-muted-foreground/50" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={dThis} fill="none" className="stroke-primary" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
