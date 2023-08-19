import { getFocusableElements } from './utilities/focus';

export default class Collapse {

  // Private properties

  #collapseButtonList  = document.querySelectorAll('[data-target-toggle]');

  // Private methods
  
  #handleCollapseClose(button, target) {
    console.log('handleCollapseClose', button, target);
    button.setAttribute('aria-expanded', false);
    target.classList.remove('shown');
  }

  #handleCollapseOpen(button, target, focusFirst) {
    button.setAttribute('aria-expanded', true);
    target.classList.add('shown');
    if (focusFirst) {
      focusFirst.focus();
    }
  }

  #handleKeyDown(collapseButton, collapseTarget, firstFocusableElement) {
    return (event) => {
      switch (event.code) {
        case 'Tab':
          if (document.activeElement === firstFocusableElement && event.shiftKey) {
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
    const collapseTargetID = event.target.getAttribute('data-target-toggle').replace(/#/, '');
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
        collapseTarget.hasAttribute('data-focus-first') ? firstFocusableElement : null
      );
    }

    collapseTarget.addEventListener('keydown', this.#handleKeyDown(collapseButton, collapseTarget, firstFocusableElement));
  }

  // Public methods

  init() {

     window.addEventListener('click', (event) => {

      event.stopPropagation();
      
      this.#collapseButtonList.forEach((collapseButton) => {
          const closeTargetID = collapseButton.getAttribute('data-target-toggle').replace(/#/, '');
          const closeTarget = document.getElementById(closeTargetID);
          const closeTargetButton = document.querySelector(`[data-target-toggle="#${closeTargetID}"]`);

          const clickedInsideButton = collapseButton.contains(event.target);
          const clickedInsideTarget = closeTarget.contains(event.target);

          // Check if target has 'data-close-outside' attribute
          const hasCloseOutsideAttr = closeTarget.hasAttribute('data-close-outside');

          console.log(
            'target = ', closeTarget,
            'hasCloseOutsideAttr = ', hasCloseOutsideAttr, 
            'clickedInsideButton = ', clickedInsideButton, 
            'clickedInsideTarget = ', clickedInsideTarget);
          

          if (hasCloseOutsideAttr && !clickedInsideButton && !clickedInsideTarget && closeTarget.classList.contains('shown')) {
            this.#handleCollapseClose(closeTargetButton, closeTarget);
          }
      });
      });

    this.#collapseButtonList.forEach((collapseButton) => {

      collapseButton.setAttribute('aria-expanded', false);

      collapseButton.addEventListener('click', (event) => {
        event.stopPropagation();
      
        this.#toggleCollapse(event, collapseButton);

        if (collapseButton.hasAttribute('data-target-close')) {
          const closeTargetID = event.target.getAttribute('data-target-close').replace(/#/, '');
          const closeTarget = document.getElementById(closeTargetID);
          const closeTargetButton = document.querySelector(`[data-target-toggle="#${closeTargetID}"]`);

          this.#handleCollapseClose(closeTargetButton, closeTarget);
        }

      });

    });

  }
}