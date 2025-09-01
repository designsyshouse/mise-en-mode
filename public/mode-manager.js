
/**
 * Adds a custom toString function to the given object.
 * Includes enumerable: false, to hide the custom toString
 * from enumerable keys.
 * 
 * @param {Object} target - The target object
 * @param {Function} value - The function to return a String
 * @returns {Object} - The target object
 */
function customToString(target, value) {
    Object.defineProperty(target, 'toString', {
        value,
        enumerable: false
    });
    return target;
}

/**
 * Creates an element to append for the <head/>
 * 
 * @param {String} tagName - The HTML tag name
 * @param {Record<string, string>} attrs - Key-value pairs representing attr="value"
 */
function headAppend(tagName, attrs) {
    // Create a HTML node from given tag name.
    const $elem = document.createElement(tagName);

    // Apply all attrs by merging the object node with the attrs.
    Object.assign($elem, attrs);

    // Append the node to the <head/>.
    document.head.appendChild($elem);
}

/**
 * Prepares a link rendering function
 * by storing the inevntory. 
 * 
 * @returns {Function} - Link attrs/tag generator function
 */
function linkify() {
    // Load the inventory before attempting to use it.
    const inventoryPromise = import('./_inventory.json', { with: { type: 'json' } }).then(mod => mod.default);
    
    /**
     * Creates the link tag for given mode
     * by looking up the alias in the inventory.
     * 
     * @param {String} - Mode alias
     * @returns {Promise<Object>} - Object representing a <link/>
     */
    return async (mode) => {
        // Ensure the inventory is available.
        const inventory = await inventoryPromise;

        // Find the href for the given mode.
        const { href } = inventory.find((entry) => entry.mode === mode) || {};
        
        // If no href is found, bail out.
        if (!href) return '';

        // Prepare as isomorphic.
        return customToString({
            href,
            rel: 'stylesheet',
            title: mode
        }, function () {
            // Function to stringify object as attr="val".
            const toAttrs = ([attr, val]) => `${attr}="${val}"`;
            // Loop over the attrs, convert to attr syntax.
            const attrs = Object.entries(this).map(toAttrs);
            // Render <link/> html.
            return `<link ${attrs.join(' ')}/>`;
        });
    }
}

/**
 * Observes for modes introduced on the client-side.
 * 
 * @param {String|Array<String>} preload - Modes that have been preloaded
 */
function observer(preload = '') {
    // Ingest stringified param as preloaded modes.
    const loaded = new Set(preload.split(','));

    // Prepare the inventory to create <link/> elements.
    const toLink = linkify();

    // Place "cursor" after this current script in the page for appending.
    const range = document.createRange();
    range.setStartAfter(document.currentScript);
    range.collapse(true);

    // Determine what HTML node should have the listener attached.
    const root = document.currentScript?.getRootNode?.() || document;

    // When a CSS animation ends:
    root.addEventListener('animationend', async (ev) => {
        // Create a list of modes found on the element.
        const modes = new Set(ev.target.dataset?.mode?.split(' ') || []);

        // List the modes that have not been loaded yet.
        const diff = [...modes.difference(loaded)];

        // Add these modes to the loaded list.
        diff.forEach((mode) => loaded.add(mode));

        // Create the <link/> elements.
        const links = await Promise.all(diff.map(toLink));

        // Append the <link/> elements directly after the current script.
        links.forEach((link) => range.insertNode(range.createContextualFragment(link)));
    });
}

/**
 * Creates the style attributes.
 * Stringifying the object renders the <style/> tag.
 * 
 * @returns {Object} - An object that represents the <style/> tag
 */
function styleAttrs() {
    // "Private" CSS animation name.
    const animationName = '_nodeinserted_';

    // Setup to "listen" for node insertion.
    const textContent = `
        :where([data-mode]) {
            visibility: hidden;
            animation: ${animationName} .0001s linear forwards;
        }

        @keyframes ${animationName} {
            to { visibility: visible }
        }
    `;

    // Prepare as isomorphic.
    return customToString({
        textContent
    }, function () {
        return `<style type="text/css">${this.textContent}</style>`
    });
}

/**
 * Creates the script attributes.
 * Stringifying the object renders the <script/> tag.
 * 
 * @returns {Object} - An object that represents the <script/> tag
 */
function scriptAttrs(modes) {
    // Prepare args to be written into IIFE.
    const args = modes.map((mode) => `'${mode}'`).join(',');

    // Scripts that are expected to be rendered on the client.
    const textContent = `
        ${customToString.toString()};
        ${linkify.toString()};
        (${observer.toString()})(${args});
    `;

    // Prepare as isomorphic.
    return customToString({
        textContent
    }, function () {
        return `<script type="javascript">${this.textContent}</script>`;
    });
}

/**
 * Creates a "mode manager" which is responsible for:
 * - Rendering the initial SSR'ed resources (when executed on the server)
 * - Appending the necessary resources to the <head/> (when executed on the client)
 * 
 * @param {String|Array<String>} preload - Modes to be preloaded
 * @returns {String} - The HTML necessary for handling mode lifecycle events
 */
export async function modeManager(preload = []) {
    // Handle a single string or list of initial modes.
    const modes = [].concat(preload);

    // Prepare the inventory to create <link/> elements.
    const toLink = linkify();

    // Prepare the resources for the page.
    const html = {
        link: await Promise.all(modes.map(toLink)),
        style: styleAttrs(),
        script: scriptAttrs(modes)
    };

    // If this is executed on the client:
    if (typeof document?.head !== 'undefined') {
        // Loop through the html resources
        Object.entries(html).forEach(([tagName, shape]) => {
            // Append the resource to the <head/>
            [].concat(shape).forEach((attrs) => headAppend(tagName, attrs));
        });
    }

    // Always return the stringified html, used for SSR.
    return Object.values(html).join('\n');
}

// If executed on the client, call immediately.
if (typeof window !== 'undefined') {
    modeManager('light');
}
