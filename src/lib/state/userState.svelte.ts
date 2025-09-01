import { table } from '$lib/pocketbase/new/tables.svelte';
import { pb } from '$lib/pocketbase/pocketbase';
import type { Row } from '$lib/pocketbase/new/row.svelte';
import type { UsersResponse } from '$lib/pocketbase/pocketBaseTypes';
import { dev as envDev, browser } from '$app/environment';
import { localStorageRune } from '$lib/capacitorPlugins/localStorageRune.svelte';

export async function getUserPromise() {
	// Ensure PocketBase auth store has had a chance to initialize from localStorage
	await Promise.resolve();
}

export const dev = //false;
	envDev ||
	(browser &&
		typeof location !== 'undefined' &&
		location.hostname.includes('vercel.app') &&
		!location.hostname.includes('cursor-games.vercel.app'));

export type UserPreferences = {
	darkMode: boolean;
	selectedBoardId?: string;
};

export const userPreferences = localStorageRune<UserPreferences>('userPreferences', {
	darkMode: false,
	selectedBoardId: undefined
});

class UserStateClass {
	userId: string | undefined = $state(pb.authStore.model?.id);
	user: Row<UsersResponse> | undefined = $state(undefined);

	initializing = $state(true);

	constructor() {
		this.initialize();
		// keep userId in sync with pb auth changes
		pb.authStore.onChange(() => {
			this.userId = pb.authStore.model?.id;
			if (this.userId) {
				this.loadUser(this.userId);
			} else {
				this.user = undefined;
			}
		});

		// Mirror theme state into preferences for persistence
		// if (browser) {
		// 	$effect(() => {
		// 		const unsubscribe = isDark.subscribe((v) => {
		// 			userPreferences.state.current.darkMode = v;
		// 		});
		// 		return () => unsubscribe();
		// 	});

		// 	// Initialize theme from preferences on first load
		// 	if (userPreferences.getPromise) {
		// 		userPreferences.getPromise().then(() => {
		// 			const prefDark = userPreferences.state.current.darkMode;
		// 			setTheme(prefDark ? 'dark' : 'light');
		// 		});
		// 	}
		// }
	}

	private async initialize() {
		try {
			if (pb.authStore.isValid && pb.authStore.model?.id) {
				this.userId = pb.authStore.model.id;
				await this.loadUser(this.userId);
			} else if (browser && dev) {
				try {
					await this.loginWithPassword('filiptangen98@gmail.com', '1234qwer');
					window.location.href = '/';
				} catch (e) {
					// ignore auto-login errors in dev-like mode
				}
			}
		} finally {
			this.initializing = false;
		}
	}

	private async loadUser(id: string) {
		this.user = await table.users.getOne(id);
	}

	get isLoggedIn() {
		return !!this.userId && pb.authStore.isValid;
	}

	async loginWithPassword(identity: string, password: string) {
		await pb.collection('users').authWithPassword(identity, password);
		this.userId = pb.authStore.model?.id;
		if (this.userId) {
			await this.loadUser(this.userId);
		}
	}

	async signupWithEmail(email: string, password: string) {
		// Create the user, then authenticate and load the profile
		await pb.collection('users').create({ email, password, passwordConfirm: password });
		await pb.collection('users').authWithPassword(email, password);
		this.userId = pb.authStore.model?.id;
		if (this.userId) {
			await this.loadUser(this.userId);
		}
	}

	logout() {
		pb.authStore.clear();
		this.userId = undefined;
		this.user = undefined;
	}
}

export const userState = new UserStateClass();
