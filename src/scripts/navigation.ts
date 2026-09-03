export function initNavigation(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');

  if (button && menu) {
    const close = () => {
      menu.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', 'Abrir menú');
    };

    button.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('is-open');
      button.setAttribute('aria-expanded', String(isOpen));
      button.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
  }

  initSectionState();
}

function initSectionState(): void {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('.site-nav a[href^="#"]:not(.button)'));
  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.hash))
    .filter((section): section is HTMLElement => Boolean(section));

  if (!sections.length) return;

  const setActive = (activeId: string | null) => {
    links.forEach((link) => {
      const isActive = link.hash === (activeId ? `#${activeId}` : '');
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  const update = () => {
    const marker = Math.min(window.innerHeight * 0.35, 320);
    let activeSection: HTMLElement | undefined;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= marker) activeSection = section;
    });

    setActive(activeSection?.id ?? null);
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
  };

  let scheduled = false;
  const scheduleUpdate = () => {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  };

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  update();
}
