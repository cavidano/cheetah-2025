export default class AlertDismissable {

  // Private properties

  #alertDismissableList = document.querySelectorAll('.alert--dismissable');

  #closeButtonHTML = `
    <button class="button button--icon-only" aria-label="Close alert" aria-describedby="alert-description">
        <span class="icon icon-close" aria-hidden="true"></span>
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

      // Add aria-live attribute for accessibility
      alertDismissable.setAttribute('role', 'alert');
      alertDismissable.setAttribute('aria-live', 'assertive');
      alertDismissable.setAttribute('aria-atomic', 'true');

      const alertCloseButton = alertDismissable.querySelector('button');
      alertCloseButton.addEventListener('click', this.#handleAlertClose(alertDismissable));
    });
  }
}