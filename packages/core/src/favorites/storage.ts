export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export function createMemoryStorage(
  initial: Record<string, string> = {},
): KeyValueStorage {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    async getItem(key) {
      const value = store.get(key);
      return value === undefined ? null : value;
    },
    async setItem(key, value) {
      store.set(key, value);
    },
  };
}
