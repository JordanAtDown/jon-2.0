import { compile } from './Compile.js';
import { extract } from './Extract.js';
import { applyTags } from './ApplyTagsFromDictionary.js';

const commands = [compile, extract, applyTags];

export default commands;
