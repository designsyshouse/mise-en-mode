import { writeFileSync as write } from 'node:fs';
import { join } from 'node:path';
import { getSchema } from './get-schema.js';
import { getInterop } from './get-interop.js';
import { getInventory } from './get-inventory.js';

import {
    SCHEMA_JSON_PATH,
    TOKENS_SCSS_PATH,
    PUBLIC_DIR,
    INVENTORY_JSON_PATH,
} from './paths.js';

// Prepare the schema based on intents.yml
const _schema = getSchema();

// Write the schema
// modes/_schema.json
write(
    SCHEMA_JSON_PATH,
    JSON.stringify(_schema, null, 2),
    'utf8'
);

// Prepare the interoperable token data.
const interopFile = getInterop();

// Write the data as SCSS
// components/_tokens.module.scss
write(
    TOKENS_SCSS_PATH,
    interopFile,
    'utf8'
);

// Prepare the inventory of all modes.
const inventory = getInventory();

// Write .css files into /public
for (const { href, css } of inventory) {
    write(
        join(PUBLIC_DIR, href),
        css,
        'utf8'
    );
}

// Write _inventory.json into /public
write(
    INVENTORY_JSON_PATH,
    String(inventory),
    'utf8'
);
