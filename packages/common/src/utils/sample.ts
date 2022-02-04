export function sample<A>(arr: A[]): A | undefined {
  if (arr.length === 0) return undefined;

  return arr[Math.floor(Math.random() * arr.length)];
}
