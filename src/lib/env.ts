// Fails loudly when a required variable is missing, so a misconfigured deploy
// cannot silently run with wrong business rules.
export function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export function num(name: string): number {
  const n = Number(env(name));
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid number in ${name}`);
  return n;
}
