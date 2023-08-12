export default class Tab {

    // Private properties
	
    #tabsList = document.querySelectorAll('.tabs');

    // Private methods

    #directionalFocus(event, index, tabsButtonList, dir) {
        event.preventDefault();

        let targetFocus = index + dir;

        if (dir === -1 && targetFocus < 0) {
            tabsButtonList[tabsButtonList.length - 1].focus();
        } else if (dir === 1 && targetFocus >= tabsButtonList.length) {
            tabsButtonList[0].focus();
        } else {
            tabsButtonList[targetFocus].focus();
        }
    }

    #deactivateTabs(tabsButtonList, tabsPanelList) {
        tabsButtonList.forEach((tab) => {
            tab.setAttribute('aria-selected', 'false');
        });

        tabsPanelList.forEach((panel) => {
            panel.classList.remove('shown');
            panel.setAttribute('hidden', '');
        });
    }

    // Public methods

    activateTab(tab, tabsButtonList, tabsPanelList) {
    
        this.#deactivateTabs(tabsButtonList, tabsPanelList);

        tab.setAttribute('aria-selected', 'true');

        let controls = tab.getAttribute('aria-controls');
        let currentTabPanel = document.getElementById(controls);

        currentTabPanel.classList.add('shown');
        currentTabPanel.removeAttribute('hidden');
    }

    // Public methods
    
    init() {

        this.#tabsList.forEach((tab) => {
            const tabsButtonList = tab.querySelectorAll('[role="tab"]');
            const tabsPanelList = tab.querySelectorAll('[role="tabpanel"]');

            tabsButtonList.forEach((tabsButton, index) => {
                tabsButton.addEventListener('click', (event) => {
                    let tab = event.target;
                    this.activateTab(tab, tabsButtonList, tabsPanelList);
                });

                tabsButton.addEventListener('keydown', (event) => {
                    switch (event.code) {
                        case 'Home':
                            event.preventDefault();
                            tabsButtonList[0].focus();
                            break;
                        case 'End':
                            event.preventDefault();
                            tabsButtonList[tabsButtonList.length - 1].focus();
                            break;
                        case 'ArrowLeft':
                            this.#directionalFocus(event, index, tabsButtonList, -1);
                            break;
                        case 'ArrowRight':
                            this.#directionalFocus(event, index, tabsButtonList, 1);
                            break;
                        default:
                        // do nothing
                    }
                });
            });
        });
        
    }
}