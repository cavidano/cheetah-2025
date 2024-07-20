import { handleOverlayOpen, handleOverlayClose } from './utilities/overlay';

export default class Navigation {

  // Private properties
  #dropdownButtonList = document.querySelectorAll('[data-toggle="dropdown"]');
  #isAnyDropdownOpen = false;

  // Private methods

  #openDropdown(dropdownButton, dropdownMenu) {
    this.#isAnyDropdownOpen = true;

    dropdownButton.setAttribute('aria-expanded', 'true');
    dropdownMenu.classList.add('shown');

    if (dropdownMenu.className.includes('mega-menu')) {
      // handleOverlayOpen();
    }
  }

  #closeDropdown(dropdownButton, dropdownMenu) {
    this.#isAnyDropdownOpen = this.#checkAnyDropdownOpen();
    dropdownMenu.classList.remove('shown');
    dropdownButton.setAttribute('aria-expanded', 'false');

    if (dropdownMenu.className.includes('mega-menu')) {
      handleOverlayClose();
    }
  }

  #setupListeners(dropdownButton, dropdownMenu) {
    const handleButtonClick = (event) => {
      event.preventDefault();
      const isShown = dropdownMenu.classList.contains('shown');

      isShown
        ? this.#closeDropdown(dropdownButton, dropdownMenu)
        : this.#openDropdown(dropdownButton, dropdownMenu);
    };

    const handleButtonMenuFocusout = (event) => {
      const relatedTarget = event.relatedTarget;

      if (
        relatedTarget && 
        !dropdownMenu.contains(relatedTarget) && 
        !dropdownButton.contains(relatedTarget)
      ) {
        this.#closeDropdown(dropdownButton, dropdownMenu);
      }
    };

    dropdownButton.addEventListener('click', handleButtonClick);
    dropdownButton.addEventListener('focusout', handleButtonMenuFocusout);
    dropdownMenu.addEventListener('focusout', handleButtonMenuFocusout);
  }

  #checkAnyDropdownOpen() {
    return Array.from(this.#dropdownButtonList).some((button) => {
      const dropdownMenu = document.getElementById(button.getAttribute('aria-controls'));
      return dropdownMenu.classList.contains('shown');
    });
  }

  #handleWindowClick = (event) => {
    if (!this.#isAnyDropdownOpen) return;

    this.#dropdownButtonList.forEach((dropdownButton) => {
      const dropdownMenu = document.getElementById(dropdownButton.getAttribute('aria-controls'));

      if (
        dropdownMenu &&
        dropdownMenu.classList.contains('shown') &&
        !dropdownMenu.contains(event.target) &&
        !dropdownButton.contains(event.target)
      ) {
        this.#closeDropdown(dropdownButton, dropdownMenu);
      }
    });
  };

  #handleEscapeKeyPress = (event) => {
    if (event.key === 'Escape' && this.#isAnyDropdownOpen) {
      this.#dropdownButtonList.forEach((dropdownButton) => {
        const dropdownMenu = document.getElementById(dropdownButton.getAttribute('aria-controls'));

        if (dropdownMenu.classList.contains('shown')) {
          this.#closeDropdown(dropdownButton, dropdownMenu);
          dropdownButton.focus();
        }
      });

      this.#isAnyDropdownOpen = false;
    }
  };

  // Public methods

  init() {
    this.#dropdownButtonList.forEach((dropdownButton) => {
      const dropdownMenuId = dropdownButton.getAttribute('aria-controls');
      const dropdownMenu = document.getElementById(dropdownMenuId);

      if (!dropdownMenu) {
        console.warn(`No dropdown menu found for ${dropdownMenuId}`);
        return;
      }

      dropdownButton.setAttribute('aria-expanded', 'false');
      dropdownButton.setAttribute('aria-haspopup', 'true');

      this.#setupListeners(dropdownButton, dropdownMenu);
    });

    window.addEventListener('click', this.#handleWindowClick);
    document.addEventListener('keydown', this.#handleEscapeKeyPress);
  }
}