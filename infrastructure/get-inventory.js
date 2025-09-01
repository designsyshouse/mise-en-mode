import { readFileSync as read, readdirSync } from 'node:fs';
import { join, parse } from 'node:path';
import { load } from 'js-yaml';
import { toVar } from './to-var.js';

import { MODES_DIR } from './paths.js';

/**
 * Creates a CSS declaration.
 * 
 * @param {Record<String, Object>} - Intent assignment 
 * @returns {String} - CSS declaration (property: value)
 */
function toDeclaration([intent, metadata]) {
    const decl = [toVar(intent), metadata.$value];
    return `${decl.join(':')};`;
}

/**
 * Creates a list of CSS declarations.
 * 
 * @param {Array<Record<String, Object>>} tokens - A collection of intent assignments.
 * @returns {String} - A list of CSS declarations
 */
function toDeclarations(tokens) {
    return Object.entries(tokens).map(toDeclaration).join('\n');
}

/**
 * Creates the representative CSS from a mode.
 * 
 * @param {String} mode - The alias for the mode
 * @param {Array<Record<String, Object>>} tokens - A collection of intent assignments.
 * @returns {String} - A CSS declaration block of property-value assignments
 */
function toCss(mode, tokens) {
    const declarations = toDeclarations(tokens);
    return `[data-mode~="${mode}"] { ${declarations} }`;
}

/**
 * Creates the inventory of modes.
 * 
 * @returns {Array<Object>} - A collection of modes as inventory
 */
export function getInventory() {
    // Target the modes directory of YAML files.
    const files = readdirSync(MODES_DIR);

    // For each file in the inventory:
    const inventory = files.reduce((acc, file) => {
        // Parse the file name and extension
        const { name, ext } = parse(file);
        
        // If the extension is not .yml, bail out.
        if (!ext.endsWith('yml')) return acc;

        // Create the filepath to read the file.
        const filepath = join(MODES_DIR, file);

        // Pull out the mode alias, tokens, and additional metadata.
        const {
            mode,
            tokens,
            ...metadata
        } = load(read(filepath, 'utf8'));
        
        // If there is no mode alias, bail out.
        if (!mode) return acc;

        // Create the CSS from mode and tokens.
        const css = toCss(mode, tokens);

        // Add this entry to the inventory.
        return acc.concat({
            mode,
            css,
            href: `_${name}.css`,
            bytes: Buffer.byteLength(css, 'utf8'),
            coverage: Object.keys(tokens),
            ...metadata
        });
    }, []);
    
    // Stringify the inventory so it can be written as JSON.
    inventory.toString = function () {

        // Omit the CSS from the stringified JSON.
        return JSON.stringify(
            this.map(({ css, ...rest }) => rest),
            null,
            2
        );
    }

    return inventory;
}
