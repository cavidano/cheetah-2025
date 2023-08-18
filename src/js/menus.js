import { handleOverlayOpen, handleOverlayClose } from './utilities/overlay';

export default class OverlayController {
    constructor() {
        this.header = document.querySelector('body > header');
        this.targetClassEl = document.querySelector('body');

        this.config = {
            attributes: true,
            attributeOldValue: true, // Necessary to get the previous value of the changed attribute
            childList: true,
            subtree: true
        };

        this.observer = new MutationObserver(this.handleMutations.bind(this));
        this.observer.observe(this.header, this.config);
    }

    handleMutations(mutations) {
        let dropdownOpen = false;

        for (let mutation of mutations) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const mutatedElement = mutation.target;

                // Check if the class was added
                if (mutatedElement.classList.contains('shown')) {
                    dropdownOpen = true;
                }
            }
        }

        // After processing all mutations, check if any child still has the 'shown' class.
        if (!dropdownOpen && this.header.querySelector('.shown')) {
            dropdownOpen = true;
        }

        // Update the class on the <html> element based on the dropdownOpen flag
        // and avoid unnecessary changes.
        if (dropdownOpen && !this.targetClassEl.classList.contains('has-popup')) {
            this.targetClassEl.classList.add('has-popup');

		handleOverlayOpen();
        } else if (!dropdownOpen && this.targetClassEl.classList.contains('has-popup')) {
            this.targetClassEl.classList.remove('has-popup');
		handleOverlayClose();
        }
    }

    // Optionally, you can add a method to disconnect the observer if needed
    disconnect() {
        this.observer.disconnect();
    }
}