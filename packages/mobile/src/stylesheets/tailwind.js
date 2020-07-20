import { create } from 'tailwind-rn';
import styles from './tailwind.json';

const { tailwind, getColor } = create(styles);
export { tailwind, getColor };
