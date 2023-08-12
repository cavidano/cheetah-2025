import { getFocusableElements } from './utilities/focus';

export default class Accordion {

	// Private properties

	#accordionList = document.querySelectorAll('.accordion');

	// Private methods

	#setFocusableElements(element = document, focusable = false) {
		const focusableElementList = getFocusableElements(element);

		focusableElementList.forEach((focusableElement) => {
			focusableElement.setAttribute('tabindex', focusable ? 0 : -1);
		});
	}

	#handleAccordionToggle = (
		accordionButton,
		currentAccordionPanel,
		accordionPanelList
	) => {
		return (event) => {

			event.preventDefault();
			event.stopPropagation();

			// Handle other accordion panels
			for (const otherAccordionPanel of accordionPanelList) {
				otherAccordionPanel.classList.remove('show');

				if (otherAccordionPanel !== currentAccordionPanel) {
					otherAccordionPanel.classList.remove('shown');
					otherAccordionPanel.style.maxHeight = null;
					otherAccordionPanel.previousElementSibling.setAttribute(
						'aria-expanded',
						false
					);
					otherAccordionPanel.setAttribute('aria-hidden', true);
					this.#setFocusableElements(otherAccordionPanel, false);
				}
			}

			// Handle current accordion panel
			currentAccordionPanel.classList.toggle('shown');

			let isExpanded = accordionButton.getAttribute('aria-expanded');

			if (isExpanded === 'true') {
				accordionButton.setAttribute('aria-expanded', false);
				currentAccordionPanel.setAttribute('aria-hidden', true);
				this.#setFocusableElements(currentAccordionPanel, false);
			} else if (isExpanded === 'false') {
				accordionButton.setAttribute('aria-expanded', true);
				currentAccordionPanel.setAttribute('aria-hidden', false);
				this.#setFocusableElements(currentAccordionPanel, true);
			}

			if (currentAccordionPanel.style.maxHeight) {
				currentAccordionPanel.style.maxHeight = null;
			} else {
				currentAccordionPanel.style.maxHeight =
					currentAccordionPanel.scrollHeight + 'px';
				currentAccordionPanel.setAttribute('aria-hidden', false);
			}

			// Trigger accordion event
			let accTrigger = new Event('accTrigger', { bubbles: true });
			document.dispatchEvent(accTrigger);
		};
	};

	#handleKeyDown = (
		accordionButton, 
		accordionButtonList, 
		index
  	) => {
		return (event) => {
			const directionalFocus = (dir) => {
				event.preventDefault();

				let targetFocus = index + dir;

				if (dir === -1 && targetFocus < 0) {
					accordionButtonList[accordionButtonList.length - 1].focus();
				} else if (dir === 1 && targetFocus >= accordionButtonList.length) {
					accordionButtonList[0].focus();
				} else {
					accordionButtonList[targetFocus].focus();
				}
			};

			switch (event.code) {
				case 'ArrowLeft':
				case 'ArrowUp':
					directionalFocus(-1);
					break;
				case 'ArrowRight':
				case 'ArrowDown':
					directionalFocus(1);
					break;
				default:
				// do nothing
			}
		};
	};

	#handleKeyUp = (
		accordionButton,
		currentAccordionPanel,
		accordionPanelList
	) => {
		return (event) => {
			if (event.code === 'Enter' && event.target.tagName !== 'BUTTON') {
				this.#handleAccordionToggle(
					accordionButton,
					currentAccordionPanel,
					accordionPanelList
				)(event);
			}
		};
	};

	// Public methods

	init() {

		this.#accordionList.forEach((accordion) => {
			const accordionButtonList = Array.from(
				accordion.querySelectorAll(':scope > [data-accordion="button"]')
			);
			const accordionPanelList = accordion.querySelectorAll(
				':scope > [data-accordion="panel"]'
			);

			accordion.addEventListener('click', (event) => {
				const accordionButton = event.target.closest(
					'[data-accordion="button"]'
				);
				if (!accordionButton) return;

				const index = accordionButtonList.indexOf(accordionButton);
				if (index === -1) return;

				const currentAccordionPanel = accordionButton.nextElementSibling;
				this.#handleAccordionToggle(
					accordionButton,
					currentAccordionPanel,
					accordionPanelList
				)(event);
			});

			accordion.addEventListener('keydown', (event) => {
				const accordionButton = event.target.closest(
					'[data-accordion="button"]'
				);
				if (!accordionButton) return;

				const index = accordionButtonList.indexOf(accordionButton);
				if (index === -1) return;

				this.#handleKeyDown(accordionButton, accordionButtonList, index)(event);
			});

			accordion.addEventListener('keyup', (event) => {
				const accordionButton = event.target.closest(
					'[data-accordion="button"]'
				);
				if (!accordionButton) return;

				const index = accordionButtonList.indexOf(accordionButton);
				const currentAccordionPanel = accordionButton.nextElementSibling;
				this.#handleKeyUp(
					accordionButton,
					currentAccordionPanel,
					accordionPanelList
				)(event);
			});

			accordionButtonList.forEach((accordionButton, index) => {
				const currentAccordionPanel = accordionButton.nextElementSibling;
				let isExpanded = accordionButton.getAttribute('aria-expanded');

				accordionButton.setAttribute('tabindex', 0);

				if (isExpanded === 'true') {
					currentAccordionPanel.style.maxHeight = currentAccordionPanel.scrollHeight + 'px';
					currentAccordionPanel.classList.add('show');
					this.#setFocusableElements(currentAccordionPanel, true);
				} else {
					accordionButton.setAttribute('aria-expanded', false);
					currentAccordionPanel.style.maxHeight = null;
					currentAccordionPanel.setAttribute('aria-hidden', true);
					this.#setFocusableElements(currentAccordionPanel, false);
				}
			});
		});
		
  	}
}