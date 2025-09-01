import { writable } from 'svelte/store';
import { userPreferences } from './userState.svelte';

export type ThemeMode = 'light' | 'dark';

function applyDarkClass(enable: boolean) {
	try {
		const root = document.documentElement;
		const body = document.body;
		if (enable) {
			root.classList.add('dark');
			body.classList.add('dark');
		} else {
			root.classList.remove('dark');
			body.classList.remove('dark');
		}
	} catch {}
}

export function initTheme() {
	try {
		const stored = localStorage.getItem('theme');
		if (stored === 'dark' || stored === 'light') {
			const dark = stored === 'dark';
			userPreferences.state.current.darkMode = dark;
			applyDarkClass(dark);
			return;
		}
		const prefersDark =
			window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		userPreferences.state.current.darkMode = prefersDark;
		applyDarkClass(prefersDark);
	} catch {}
}

export function setTheme(mode: ThemeMode) {
	const dark = mode === 'dark';
	userPreferences.state.current.darkMode = dark;
	try {
		localStorage.setItem('theme', mode);
	} catch {}
	applyDarkClass(dark);
}

export function toggleTheme() {
	setTheme(userPreferences.state.current.darkMode ? 'light' : 'dark');
}
