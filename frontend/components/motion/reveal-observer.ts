/**
 * One IntersectionObserver for the whole site.
 *
 * Reveals used to create an observer each. With two primitives (block reveals
 * and headline reveals) across seven sections that is dozens of observers all
 * watching the same scroll — pointless work, and the kind of thing that turns
 * a smooth page into a jittery one on a mid-range phone.
 *
 * So there is exactly one, created lazily on first use, with one threshold and
 * one root margin shared by everything. Callbacks are dropped as soon as their
 * element has been seen, and elements are forgotten when they unmount.
 */

type EnterCallback = () => void;

type RevealObserver = {
  observe: (element: Element, onEnter: EnterCallback) => () => void;
};

const callbacks = new WeakMap<Element, EnterCallback>();

let observer: IntersectionObserver | null = null;

function createObserver(): IntersectionObserver | null {
  return new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const callback = callbacks.get(entry.target);
        if (callback) callback();
        // Seen once is enough — reveals never replay, which is also what stops
        // them firing again when someone scrolls back up.
        callbacks.delete(entry.target);
        instance?.unobserve(entry.target);
      }
    },
    // One threshold for the site: a block has to be meaningfully in view before
    // its motion starts, and the negative bottom margin keeps reveals from
    // firing while something is still only peeking over the fold.
    { threshold: 0.16, rootMargin: "0px 0px -64px 0px" },
  );
}

let instance: IntersectionObserver | null = null;

export function sharedRevealObserver(): RevealObserver {
  if (typeof IntersectionObserver === "undefined") {
    // Environments without the API just show everything immediately.
    return { observe: (_element, onEnter) => (onEnter(), () => {}) };
  }

  if (!observer) {
    observer = createObserver();
    instance = observer;
  }

  return {
    observe(element, onEnter) {
      callbacks.set(element, onEnter);
      observer?.observe(element);
      return () => {
        callbacks.delete(element);
        observer?.unobserve(element);
      };
    },
  };
}
