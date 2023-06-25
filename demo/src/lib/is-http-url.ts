export function isHttpUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return /^https?:$/.test(protocol);
  } catch {
    return false;
  }
}
