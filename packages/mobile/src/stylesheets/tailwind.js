import { create } from 'tailwind-rn';

import { isNumber } from '../utils';

import tailwindStyles from './tailwind.json';
import extrasStyles from './extras.json';

const styles = { ...tailwindStyles, ...extrasStyles };
const { tailwind: _tailwind, getColor } = create(styles);

const tailwind = (classStr, windowWidth) => {
  if (!isNumber(windowWidth)) {
    console.log('In tailwind, found NAN windowWidth: ', windowWidth);
  }

  const v1 = classStr.includes('text') ? 1 : 0;
  const v2 = classStr.includes('font') ? 1 : 0;
  if (v1 + v2 === 1) console.warn('Need to have both text size and font weight!');

  return _tailwind(classStr, windowWidth);
};

export { tailwind, getColor };
