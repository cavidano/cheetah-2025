import { getFocusableElements } from './utilities/focus';

export default class Collapse {

  // Private properties
  
  #collapseButtonList = document.querySelectorAll('[data-toggle="collapse"]');

  // Private methods

  #handleCollapseClose(button, target) {
    button.setAttribute('aria-expanded', false);
    target.classList.remove('shown');
    target.setAttribute('aria-hidden', 'true');
  }

  #handleCollapseOpen(button, target, focusFirst) {
    button.setAttribute('aria-expanded', true);
    target.classList.add('shown');
    target.setAttribute('aria-hidden', 'false');

    if (focusFirst) {
      focusFirst.focus();
    }
  }

  #handleKeyDown(collapseButton, collapseTarget, firstFocusableElement) {
    return (event) => {
      switch (event.code) {
        case 'Tab':
          if (
            document.activeElement === firstFocusableElement &&
            event.shiftKey
          ) {
            event.preventDefault();
            collapseButton.focus();
          }
          break;
        case 'Escape':
          this.#handleCollapseClose(collapseButton, collapseTarget);
          break;
        default:
        // do nothing
      }
    };
  }

  #toggleCollapse(event, collapseButton) {
    const collapseTargetID = collapseButton
      .getAttribute('aria-controls')
      .replace(/#/, '');
    const collapseTarget = document.getElementById(collapseTargetID);

    const focusableElements = getFocusableElements(collapseTarget);
    const firstFocusableElement = focusableElements[0];
    const isExpanded = collapseButton.getAttribute('aria-expanded');

    if (isExpanded === 'true') {
      this.#handleCollapseClose(collapseButton, collapseTarget);
    } else if (isExpanded === 'false') {
      this.#handleCollapseOpen(
        collapseButton,
        collapseTarget,
        collapseTarget.hasAttribute('data-focus-first')
          ? firstFocusableElement
          : null
      );
    }

    collapseTarget.addEventListener(
      'keydown',
      this.#handleKeyDown(collapseButton, collapseTarget, firstFocusableElement)
    );
  }

  // Public methods

  init() {
    this.#collapseButtonList.forEach((collapseButton) => {
      const collapseTargetID = collapseButton.getAttribute('aria-controls').replace(/#/, '');
      const collapseTarget = document.getElementById(collapseTargetID);

      collapseButton.setAttribute('aria-expanded', 'false');
      collapseTarget.setAttribute('aria-hidden', 'true');

      collapseButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.#toggleCollapse(event, collapseButton);

        if (collapseButton.hasAttribute('data-target-close')) {
          const closeTargetID = collapseButton.getAttribute('data-target-close').replace(/#/, '');
          const closeTarget = document.getElementById(closeTargetID);
          const closeTargetButton = document.querySelector(`[aria-controls="${closeTargetID}"]`);

          if (closeTarget && closeTargetButton) {
            this.#handleCollapseClose(closeTargetButton, closeTarget);
          } else {
            console.error(`Could not find close target or close target button for ID ${closeTargetID}`);
          }
        }
      });
    });
  }
}