// WARNING: in-memory, per server instance. On serverless hosting each instance has its
// own counter, so this only slows casual abuse. Replace with a shared store
// (for example Upstash Redis) before launch.
const hits = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset < now) {
    hits.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  entry.n += 1;
  return entry.n <= limit;
}

export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
