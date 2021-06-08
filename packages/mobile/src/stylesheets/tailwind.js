import { create } from 'tailwind-rn';
import tailwindStyles from './tailwind.json';
import extrasStyles from './extras.json';

const styles = { ...tailwindStyles, ...extrasStyles };
const { tailwind: _tailwind, getColor } = create(styles);

const tailwind = (classNames, windowWidth = null) => {

  const v1 = classNames.includes('text') ? 1 : 0;
  const v2 = classNames.includes('font') ? 1 : 0;
  if (v1 + v2 === 1) console.warn('Need to have both text size and font weight!');

  return _tailwind(classNames, windowWidth);
};

export { tailwind, getColor };
