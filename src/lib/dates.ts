/** Date helpers shared across screens. Plans index days 0=Mon..6=Sun. */

export const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'] as const;

/** ISO date (yyyy-mm-dd) of the upcoming Monday — used as a plan's week_start. */
export function nextMonday(from: Date = new Date()): string {
  const d = new Date(from);
  const day = d.getDay(); // 0=Sun..6=Sat
  const delta = (8 - (day === 0 ? 7 : day)) % 7 || 7;
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

/** Map JS getDay() (0=Sun) to our plan index (0=Mon..6=Sun). */
export function weekdayIndex(from: Date = new Date()): number {
  return (from.getDay() + 6) % 7;
}
