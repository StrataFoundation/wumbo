function isElementInViewport(el: any) {
  var rect = el.getBoundingClientRect();

  return (
    rect.top >= -1000 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) +
        1000 /* Scroll 1000 ahead and 1000 behind*/ &&
    rect.right <=
      (window.innerWidth ||
        document.documentElement.clientWidth) /* or $(window).width() */
  );
}

export function getVisibleElementsBySelector(selector: string): Element[] {
  return Array.from(document.querySelectorAll(selector).entries())
    .map(([_, ref]) => ref)
    .filter(isElementInViewport);
}
