import { writable, type Readable } from 'svelte/store';

export function awaitStore<T>(init: T, get: () => Promise<T>) {
  const { subscribe, set } = writable(init);
  get().then(x => set(x));
  return { subscribe };
}
