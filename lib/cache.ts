type CacheRecord<T> = {
  value: T;
  expiresAt: number;
};

class TTLCache {
  private store = new Map<string, CacheRecord<unknown>>();

  constructor(private readonly defaultTtlMs: number) {}

  get<T>(key: string): T | undefined {
    const record = this.store.get(key) as CacheRecord<T> | undefined;
    if (!record) return undefined;

    if (Date.now() > record.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return record.value;
  }

  set<T>(key: string, value: T, ttlMs?: number) {
    const expiresAt = Date.now() + (ttlMs ?? this.defaultTtlMs);
    this.store.set(key, { value, expiresAt });
  }

  delete(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

export const apiCache = new TTLCache(60_000);

export type { TTLCache };
