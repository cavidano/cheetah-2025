export default class AlertDismissable {

  // Private properties
  
  #alertDismissableList = document.querySelectorAll('.alert--dismissable');

  #closeButtonHTML = `
    <button class="button button--icon-only">
        <span class="icon icon-close" aria-label="Close" aria-hidden="true">
    </button>
  `;

  // Private methods

  #handleAlertClose = (alertDismissable) => {
    return (event) => {

      event.preventDefault();
    
      alertDismissable.classList.add('dismissed');

      const dismissed = document.querySelector('.dismissed');

      dismissed.addEventListener('animationend', () => {
        alertDismissable.remove();
      });
    }
  }

  // Public methods

  init() {
    
    this.#alertDismissableList.forEach((alertDismissable) => {
          
        alertDismissable.insertAdjacentHTML('afterbegin', this.#closeButtonHTML);

        const alertCloseButton = alertDismissable.querySelector('button');

        alertCloseButton.addEventListener('click', this.#handleAlertClose(alertDismissable));

    });
    
  }
}