/**
 * @fileoverview User interface controls module.
 * Handles settings panel visibility, dark mode toggle, and UI preferences
 * persistence using localStorage.
 * @module ui
 */

/**
 * Loads the dark mode preference from localStorage and applies it.
 * Sets the data-theme attribute on the document root and syncs the toggle checkbox.
 * @private
 */
function loadDarkMode() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
    document.getElementById('dark-mode-toggle').checked = isDarkMode;
}

/**
 * Saves the dark mode preference to localStorage.
 * @param {boolean} isDarkMode - Whether dark mode is enabled.
 * @private
 */
function saveDarkMode(isDarkMode) {
    localStorage.setItem('darkMode', isDarkMode);
}

/**
 * Initializes all UI event handlers and loads saved preferences.
 * Sets up the settings panel toggle, click-outside-to-close behavior,
 * and dark mode toggle functionality.
 * @example
 * // Initialize UI during game setup
 * initUI();
 */
export function initUI() {
    const settingsIcon = document.getElementById('settings-icon');
    const settingsPanel = document.getElementById('settings-panel');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    loadDarkMode();

    settingsIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsPanel.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && settingsPanel.classList.contains('visible')) {
            settingsPanel.classList.remove('visible');
        }
    });

    settingsPanel.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    darkModeToggle.addEventListener('change', (e) => {
        const isDarkMode = e.target.checked;
        document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : '');
        saveDarkMode(isDarkMode);
    });
}
