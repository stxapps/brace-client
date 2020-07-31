import { create } from 'tailwind-rn';
import tailwindStyles from './tailwind.json';
import extrasStyles from './extras.json';

const styles = { ...tailwindStyles, ...extrasStyles };

const { tailwind, getColor } = create(styles);
export { tailwind, getColor };
