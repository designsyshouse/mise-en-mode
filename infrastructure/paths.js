import { join } from 'node:path';

// Components, used to demonstrate interoperable tokens.
export const COMPONENTS_DIR = join(process.cwd(), 'components');

// Infrastructure, holds most of the scripts writing files.
export const INFRASTRUCTURE_DIR = join(process.cwd(), 'infrastructure');

// Modes, place to modify expressive modes as YAML.
export const MODES_DIR = join(process.cwd(), 'modes');

// Public, hosts files (eg., CSS) to the web page.
export const PUBLIC_DIR = join(process.cwd(), 'public');

// The filepath to list of all intents.
export const INTENTS_YAML_PATH = join(INFRASTRUCTURE_DIR, 'intents.yml');

// The default filepath created during mode bootstrapping.
export const NEWMODE_YAML_PATH = join(MODES_DIR, 'newmode.yml');

// The filepath for the mode YAML schema. 
export const SCHEMA_JSON_PATH = join(MODES_DIR, '_schema.json');

// The filepath for interoperable tokens.
export const TOKENS_SCSS_PATH = join(COMPONENTS_DIR, '_tokens.module.scss');

// The filepath to host the inventory for the mode manager.
export const INVENTORY_JSON_PATH = join(PUBLIC_DIR, '_inventory.json');
