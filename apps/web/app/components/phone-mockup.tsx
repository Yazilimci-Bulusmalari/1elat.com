import { Send, Signal, Wifi, BatteryFull } from "lucide-react";
import { useT } from "~/lib/i18n";

function FakeQR(): React.ReactElement {
  const cells: boolean[] = [];
  let seed = 1337;
  for (let i = 0; i < 21 * 21; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed % 2 === 0);
  }

  function isFinder(r: number, c: number): boolean {
    const inTL = r < 7 && c < 7;
    const inTR = r < 7 && c > 13;
    const inBL = r > 13 && c < 7;
    return inTL || inTR || inBL;
  }

  function finderCell(r: number, c: number, originR: number, originC: number): boolean {
    const rr = r - originR;
    const cc = c - originC;
    if (rr === 0 || rr === 6 || cc === 0 || cc === 6) return true;
    if (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4) return true;
    return false;
  }

  return (
    <div
      className="grid aspect-square w-full overflow-hidden rounded-md bg-white p-2"
      style={{ gridTemplateColumns: "repeat(21, minmax(0, 1fr))" }}
      aria-hidden="true"
    >
      {Array.from({ length: 21 * 21 }).map((_, idx) => {
        const r = Math.floor(idx / 21);
        const c = idx % 21;
        let on = cells[idx];
        if (isFinder(r, c)) {
          const originR = r < 7 ? 0 : 14;
          const originC = c < 7 ? 0 : 14;
          on = finderCell(r, c, originR, originC);
        }
        return (
          <div
            key={idx}
            className={on ? "bg-neutral-900" : "bg-white"}
            style={{ aspectRatio: "1 / 1" }}
          />
        );
      })}
    </div>
  );
}

export function PhoneMockup(): React.ReactElement {
  const t = useT();

  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div
        className="pointer-events-none absolute -inset-10 -z-10"
        aria-hidden="true"
      >
        <div className="absolute left-[-20%] top-[10%] h-2 w-32 rotate-[-25deg] rounded-full bg-accent-brand/70 blur-[2px]" />
        <div className="absolute right-[-15%] top-[5%] h-2 w-24 rotate-[35deg] rounded-full bg-accent-brand/60 blur-[2px]" />
        <div className="absolute right-[-25%] bottom-[20%] h-2 w-28 rotate-[15deg] rounded-full bg-accent-brand/60 blur-[2px]" />
        <div className="absolute left-[-15%] bottom-[10%] h-2 w-20 rotate-[-15deg] rounded-full bg-accent-brand/70 blur-[2px]" />
      </div>

      <div className="relative rounded-[3rem] border-8 border-neutral-900 bg-card shadow-2xl dark:border-neutral-800">
        <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral-900 dark:bg-neutral-800" />

        <div className="overflow-hidden rounded-[2.25rem] bg-card">
          <div className="flex items-center justify-between px-6 pt-3 pb-2 text-[11px] font-medium text-foreground/80">
            <span>9:41</span>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <BatteryFull className="h-4 w-4" />
            </div>
          </div>

          <div className="px-6 pb-8 pt-6">
            <h3 className="mb-4 text-center text-2xl font-bold tracking-tight">
              {t.home.phone.title}
            </h3>

            <div className="rounded-2xl bg-muted p-3">
              <FakeQR />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {t.home.phone.scanHint}
            </p>

            <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              {t.home.phone.welcome}
            </p>

            <form className="mt-3 flex items-center gap-2">
              <input
                type="email"
                placeholder={t.home.phone.emailPlaceholder}
                className="h-9 w-full flex-1 rounded-lg border border-border bg-background px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              />
              <button
                type="button"
                className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-accent-brand px-3 text-xs font-semibold text-accent-brand-foreground hover:bg-accent-brand/90"
              >
                <Send className="h-3 w-3" />
                {t.home.phone.send}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
