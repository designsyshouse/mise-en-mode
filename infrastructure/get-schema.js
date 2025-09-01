import { readFileSync as read } from 'node:fs';
import { load } from 'js-yaml';

import { INTENTS_YAML_PATH } from './paths.js';

/**
 * Creates a node representing the intent for YAML.
 * 
 * @param {String} intent - $-prefixed intent name
 * @returns {Object} - A schema node for the intent
 */
function createValue(intent) {
    const base = { 
        $value: { 
            type: ['number', 'string']
        }
    };

    if (intent.includes('fontFamily')) {
        base.$fallback = {
            type: ['string']
        };
    }

    return base;
}

/**
 * Create the tree representing the mode schema.
 * 
 * @param {Array<String>} intents - The list of $-prefixed intent names
 * @returns {Object} - Schema tree
 */
function createTree(intents) {
    return intents.reduce((acc, intent) => {
        return Object.assign(acc, {
            [token]: {
                type: 'object',
                additionalProperties: false,
                required: ['$value'],
                properties: createValue(intent)
            }
        });
    }, {});
}

/**
 * Creates the schema for validation.
 * 
 * @param {Array<String>} intents - The list of $-prefixed intent names
 * @returns {Object} - The full schema as data
 */
function createSchema(intents) {
    return {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        required: ['mode', 'tokens'],
        properties: {
            mode: {
                type: 'string',
                additionalProperties: false
            },
            tokens: {
                type: 'object',
                additionalProperties: false,
                properties: createTree(intents)
            }
        }
    };
}

/**
 * Loads the intents.yml to return the expected schema.
 * 
 * @returns {String} - The schema in JS notation
 */
export function getSchema() {
    const intents = load(read(INTENTS_YAML_PATH, 'utf8'));
    return createSchema(intents);
}
