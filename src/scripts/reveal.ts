export function initReveal(): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!elements.length) return;

  const revealAll = () => elements.forEach((element) => element.classList.add('is-visible'));
  document.documentElement.dataset.revealEnabled = 'true';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: '0px 0px -6% 0px' },
  );
  elements.forEach((element) => observer.observe(element));
}
