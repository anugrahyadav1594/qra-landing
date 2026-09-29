/**
 * One IntersectionObserver for "is this on screen".
 *
 * Sections with continuous motion (the breathing environment, the data field)
 * must stop working the moment they leave the viewport — an animation that runs
 * behind three screens of content is pure cost. This shares a single observer
 * between every subscriber, and reports both directions.
 *
 * The default state is *running*: the attribute this drives is only ever written
 * to stop something, so a page with no JavaScript keeps its (static) imagery.
 */

type ScreenCallback = (onScreen: boolean) => void;

const callbacks = new WeakMap<Element, ScreenCallback>();
let observer: IntersectionObserver | null = null;

export function observeOnScreen(element: Element, onChange: ScreenCallback): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onChange(true);
    return () => {};
  }

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) callbacks.get(entry.target)?.(entry.isIntersecting);
      },
      // A generous margin, so nothing starts or stops exactly at the fold.
      { rootMargin: "12% 0px 12% 0px" },
    );
  }

  callbacks.set(element, onChange);
  observer.observe(element);

  return () => {
    callbacks.delete(element);
    observer?.unobserve(element);
  };
}
