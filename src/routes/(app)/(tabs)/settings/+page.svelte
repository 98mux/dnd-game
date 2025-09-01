<script lang="ts">
	import { onMount } from 'svelte';
	import { initTheme, toggleTheme, setTheme } from '$lib/state/theme';
	import Navbar from '$lib/mainscreen/Navbar.svelte';
	import { userPreferences } from '$lib/state/userState.svelte';
	onMount(initTheme);
</script>

<Navbar />

<div class="p-4 space-y-4 text-black dark:text-white">
	<h1 class="text-xl font-semibold">Settings</h1>
	<div class="flex items-center justify-between">
		<span>Dark mode</span>
		<button
			class="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
			on:click={toggleTheme}>{userPreferences.state.current.darkMode ? 'On' : 'Off'}</button
		>
	</div>
	<div class="flex gap-2">
		<button
			class="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
			on:click={() => setTheme('light')}>Light</button
		>
		<button
			class="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
			on:click={() => setTheme('dark')}>Dark</button
		>
	</div>
</div>
