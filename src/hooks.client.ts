import { Dialog } from '@capacitor/dialog';
import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = async ({ error, event }) => {
	// console.log('I AM HERE');
	// Dialog.alert({ title: 'Error', message: 'bro' });
	console.error(error, event);
};

// window.addEventListener('error', (event) => {
// Dialog.alert({ title: 'Error', message: event.message });
// console.log('I AM HERE');
// console.error(event);
// });

// Dialog.alert({ title: 'hello', message: 'world' });
