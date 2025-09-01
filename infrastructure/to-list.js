/**
 * Converts a collection into a stringified list.
 * 
 * @param {Array<any>} items - An array of items 
 * @param {Function} fn - The function to mutate into a string 
 * @returns {String} - A stringified list representing the input
 */
export function toList(items, fn) {
    return items.map(fn).join('\n');
}
