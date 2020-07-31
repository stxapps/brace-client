import { PATTERNS } from './const';

const PATTERN_MAP = {};
for (let i = 0; i < PATTERNS.length; i++) {
  //PATTERN_MAP[PATTERNS[i]] = require(`../images/card-item/pattern-${PATTERNS[i]}.png`);
  PATTERN_MAP[PATTERNS[i]] = require(`../images/card-item/black.jpg`);
}

export { PATTERN_MAP };
