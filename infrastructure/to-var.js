/**
 * Standardizes the conversion between intent syntax
 * and CSS custom properties.
 * 
 * @param {String} intent - A $-prefixed intent name
 * @returns {String} - A double-hyphened CSS custom property
 */
export function toVar(intent) {
    return intent.replace('$', '--🔒');
}
