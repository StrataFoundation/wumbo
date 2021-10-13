export function getElementsBySelector(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector).entries()).map(
    ([_, ref]) => ref
  );
}
