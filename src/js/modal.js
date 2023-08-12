import { handleOverlayOpen, handleOverlayClose } from './utilities/overlay';

export default class Modal {

  // Private properties

  #modalList = document.querySelectorAll('.modal');
  #modalButtonList = document.querySelectorAll('[data-modal-open]');
  #outsideClickHandlers = new Map();

  // Private methods

  #addOutsideClickHandler(modal, handler) {
    window.addEventListener('click', handler);
    this.#outsideClickHandlers.set(modal, handler);
  }

  #removeOutsideClickHandler(modal) {
    const handler = this.#outsideClickHandlers.get(modal);
    if (handler) {
      window.removeEventListener('click', handler);
      this.#outsideClickHandlers.delete(modal);
    }
  }

  // Public methods

  openModal(modalTarget) {

    if (!modalTarget) {
      console.warn('Modal target not found.');
      return;
    }

    handleOverlayOpen(modalTarget);
    
    const modalContent = modalTarget.querySelector('.modal__content');
    
    if (!modalContent) {
      console.warn('Modal content not found.');
      return;
    }

    if (modalTarget.classList.contains('modal--scroll-all')) {
      modalTarget.scrollTop = 0;
    }

    const modalCloseList = modalTarget.querySelectorAll('[data-modal-close]');
    
    const handleCloseOutside = (event) => {
      let modalContentClick = modalContent.contains(event.target);
      if (!modalContentClick) {
        handleOverlayClose(modalTarget);
        this.#removeOutsideClickHandler(modalTarget);
      }
    }

    modalCloseList.forEach((modalClose) => {
      modalClose.addEventListener('click', () => {
        handleOverlayClose(modalTarget);
        this.#removeOutsideClickHandler(modalTarget);
      });
      modalClose.setAttribute('aria-label', 'Close Modal Window');
    });

    if (modalTarget.dataset.modalCloseOutside === 'true') {
      this.#addOutsideClickHandler(modalTarget, handleCloseOutside);
    }
  }

  init() {

    this.#modalList.forEach((modal) => {
      const modalContainer = modal.querySelector('.modal__content');
      modalContainer.setAttribute('role', 'dialog');
      modalContainer.setAttribute('aria-modal', true);
      modal.setAttribute('aria-hidden', true);
    });

    this.#modalButtonList.forEach((modalButton) => {
      modalButton.addEventListener('click', (event) => {
        const modalTargetID = event.target.getAttribute('data-modal-open').replace(/#/, '');
        const modalTarget = document.getElementById(modalTargetID)
        this.openModal(modalTarget);
        event.stopPropagation();
      });
    });
    
  }
}