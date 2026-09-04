export function initContact(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-contact-dialog]');
  const form = dialog?.querySelector<HTMLFormElement>('[data-contact-form]');
  const closeButton = dialog?.querySelector<HTMLButtonElement>('[data-contact-close]');
  const submitButton = dialog?.querySelector<HTMLButtonElement>('[data-contact-submit]');
  const status = dialog?.querySelector<HTMLElement>('[data-contact-status]');
  const openers = Array.from(document.querySelectorAll<HTMLElement>('[data-contact-open]'));
  if (!dialog || !closeButton || !openers.length) return;

  let returnFocus: HTMLElement | null = null;
  let submitting = false;

  const close = () => {
    if (dialog.open) dialog.close();
    if (status) status.textContent = '';
    if (submitButton) submitButton.disabled = false;
    submitting = false;
    returnFocus?.focus();
  };

  const open = (opener: HTMLElement) => {
    returnFocus = opener;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    closeButton.focus();
  };

  openers.forEach((opener) => {
    opener.addEventListener('click', (event) => {
      event.preventDefault();
      open(opener);
    });
  });
  closeButton.addEventListener('click', close);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) close();
  });
  if (form && submitButton && status) {
    form.addEventListener('submit', () => {
      if (submitting) return;
      submitting = true;
      submitButton.disabled = true;
      status.textContent = 'Verificando acceso seguro…';
    });
  }
}
