import { writable, type Readable } from "svelte/store";

export interface PromiseStoreValue<T> {
  last: T;
  loading: boolean;
  error?: any;
}

export interface PromiseStore<T> extends Readable<PromiseStoreValue<T>> {
  load(promise: Promise<T>): void;
}

export function promiseStore<T>(initial: T): PromiseStore<T> {
  let inner: PromiseStoreValue<T> = { last: initial, loading: false };

  const { subscribe, set } = writable(inner);

  let tick = 0;

  async function load(promise: Promise<T>) {
    inner.loading = true;
    set(inner);
    const tock = ++tick;
    const [result] = await Promise.allSettled([promise]);
    if (tick === tock) {
      if (result.status === 'fulfilled') {
        inner.last = result.value;
        inner.error = undefined;
      } else {
        inner.error = result.reason;
      }
      inner.loading = false;
      set(inner);
    }
  }

  return {
    subscribe,
    load,
  };
}
