export function initGallery(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-gallery-dialog]');
  const image = dialog?.querySelector<HTMLImageElement>('[data-gallery-dialog-image]');
  const caption = dialog?.querySelector<HTMLElement>('[data-gallery-caption]');
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-gallery-close]');
  const previousButton = dialog?.querySelector<HTMLButtonElement>('[data-gallery-prev]');
  const nextButton = dialog?.querySelector<HTMLButtonElement>('[data-gallery-next]');
  const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-gallery-trigger]'));
  if (!dialog || !image || !caption || !closeButton || !previousButton || !nextButton || !triggers.length) return;

  let currentIndex = 0;
  let returnFocus: HTMLButtonElement | null = null;

  const update = (index: number) => {
    currentIndex = (index + triggers.length) % triggers.length;
    const source = triggers[currentIndex].querySelector<HTMLImageElement>('img');
    if (!source) return;
    image.src = source.currentSrc || source.src;
    image.alt = source.alt;
    caption.textContent = source.alt;
    previousButton.disabled = triggers.length < 2;
    nextButton.disabled = triggers.length < 2;
  };

  const close = () => {
    if (dialog.open) dialog.close();
    returnFocus?.focus();
  };

  const open = (index: number, trigger: HTMLButtonElement) => {
    returnFocus = trigger;
    update(index);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    closeButton.focus();
  };

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => open(index, trigger));
  });
  closeButton.addEventListener('click', close);
  previousButton.addEventListener('click', () => update(currentIndex - 1));
  nextButton.addEventListener('click', () => update(currentIndex + 1));
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const focusable = [closeButton, previousButton, nextButton];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}
