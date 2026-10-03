/**
 * One IntersectionObserver for "is this on screen".
 *
 * Sections with continuous motion (the breathing environment)
 * must stop working the moment they leave the viewport — an animation that runs
 * behind three screens of content is pure cost. This shares a single observer
 * between every subscriber, and reports both directions.
 *
 * The default state is *running*: the attribute this drives is only ever written
 * to stop something, so a page with no JavaScript keeps its (static) imagery.
 */

type ScreenCallback = (onScreen: boolean) => void;

const callbacks = new WeakMap<Element, ScreenCallback>();
const aheadCallbacks = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | null = null;
let aheadObserver: IntersectionObserver | null = null;

/**
 * "Is this close enough to be worth preparing?" — the same single-observer idea,
 * with a margin of one viewport, for work that should be ready before it is
 * seen but not paid for at load (a video that has to be mounted, decoded and
 * seeked to frame zero).
 */
export function observeAhead(element: Element, onApproach: () => void): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onApproach();
    return () => {};
  }

  if (!aheadObserver) {
    aheadObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) aheadCallbacks.get(entry.target)?.();
        }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
  }

  aheadCallbacks.set(element, onApproach);
  aheadObserver.observe(element);

  return () => {
    aheadCallbacks.delete(element);
    aheadObserver?.unobserve(element);
  };
}

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
