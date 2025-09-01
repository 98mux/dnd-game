import _ from 'lodash';
import { v4 } from 'uuid';

export const generateId = () => v4();

export function debounceClick<T>(callback: T, delay: number = 500) {
	return _.debounce(callback, delay, {
		leading: true,
		trailing: false,
		maxWait: delay
	});
}

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
