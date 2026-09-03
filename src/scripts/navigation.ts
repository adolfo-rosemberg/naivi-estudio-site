export function initNavigation(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  if (!button || !menu) return;

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
