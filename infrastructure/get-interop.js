import { readFileSync as read } from 'node:fs';
import { load } from 'js-yaml';
import { toList } from './to-list.js';
import { toVar } from './to-var.js';

import { INTENTS_YAML_PATH } from './paths.js';

/**
 * Transforms intent into usable CSS Custom Property.
 * 
 * @param {String} intent - $-prefixed intent name
 * @returns {String} - CSS Custom Property wrapped in var()
 * 
 * @example var(--🔒intent)
 */
function toCSSVar(intent) {
    return `var(${toVar(intent)})`;
}

/**
 * Creates a SCSS-CSS var assignment.
 * 
 * @param {String} intent - $-prefixed intent name
 * @returns {String} - The property-value assignment for SCSS
 * 
 * @example $intent: var(--🔒intent);
 */
function toSCSSVar(intent) {
    return `${intent}: ${toCSSVar(intent)};`;
}

/**
 * Creates a single interpolated assignment.
 * 
 * @param {String} intent - $-prefixed intent name
 * @returns {String} - An interpolation assignment to CSS var
 * 
 * @example #{'$intent'}: $intent;
 */
function toInterpolated(intent) {
    return `#{'${intent}'}: ${intent};`;
}

/**
 * Creates the CSS Modules :export block.
 * 
 * @param {Array<String>} intents - A collection of $-prefixed intent names
 * @returns {String} - The :export key meant for import into CSS modules
 */
function toModuleExports(intents) {
    const interpolated = toList(intents, toInterpolated);
    return `:export { ${interpolated} }`;
}

/**
 * Creates the CSS Modules token export.
 * 
 * @returns {String} - The interoperable tokens file,
 * expected as _tokens.module.scss
 * 
 * @example
 * $intent: var(--intent);
 * 
 * :export {
 *  #{'$intent'}: $intent;
 * }
 */
export function getInterop() {
    const intents = load(read(INTENTS_YAML_PATH, 'utf8'));
    return [
        toList(intents, toSCSSVar),
        toModuleExports(intents)
    ].join('\n');
}
