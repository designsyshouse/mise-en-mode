import { writeFileSync as write } from 'node:fs';
import { dump } from 'js-yaml';
import { getSchema } from './get-schema.js';

import { NEWMODE_YAML_PATH } from './paths.js';

// Used for YAML validators to refer to schema.
const COMMENT_HEADER = '# yaml-language-server: $schema=./_schema.json';

/**
 * Merges the given object into the accumulator.
 * Used in the recursive reduce function.
 * 
 * @param {Object} acc - Reductive accumulator
 * @param {Record<String, Object>} record - Entry within the tree
 * @returns {Object} - The accumulator
 */
function merge(acc, [property, value]) {
    return Object.assign(acc, { [property]: recurse(value?.properties) });
}

/**
 * Recursively builds tree nodes from the node or schema properties.
 * 
 * @param {Object} properties - The properties object on the tree
 * @returns {Object} - A part of the tree based on the schema
 */
function recurse(properties) {
    if (!properties) return null;
    return Object.entries(properties).reduce(merge, {});
}

// Get the schema.
const _schema = getSchema();

// Use the schema to create the template.
const data = recurse(_schema.properties);

// Write the template as YAML.
write(
    NEWMODE_YAML_PATH,
    [COMMENT_HEADER, dump(data)].join('\n'),
    'utf8'
);
