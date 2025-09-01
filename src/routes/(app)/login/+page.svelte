<script lang="ts">
	import { userState } from '$lib/state/userState.svelte';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	let email = $state('');
	let password = $state('');
	let error: string | undefined = $state(undefined);
	let loading = $state(false);

	const shouldRedirectHome = $derived(!userState.initializing && userState.isLoggedIn);
	$effect(() => {
		if (browser && shouldRedirectHome) {
			window.location.href = '/';
		}
	});

	async function login(e: Event) {
		e.preventDefault();
		loading = true;
		error = undefined;
		try {
			await userState.loginWithPassword(email, password);
			window.location.href = '/';
		} catch (err: any) {
			error = err?.message || 'Login failed';
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-[100dvh] flex items-center justify-center p-6">
	<form class="w-full max-w-sm space-y-4" onsubmit={login}>
		<h1 class="text-2xl font-semibold text-center">Sign in</h1>
		{#if error}
			<div class="text-red-600 text-sm">{error} (Have you signed up yet?)</div>
		{/if}
		<div class="space-y-2">
			<label class="block text-sm" for="email-input">Email</label>
			<input
				id="email-input"
				class="w-full border rounded px-3 py-2"
				type="email"
				bind:value={email}
				required
			/>
		</div>
		<div class="space-y-2">
			<label class="block text-sm" for="password-input">Password</label>
			<input
				id="password-input"
				class="w-full border rounded px-3 py-2"
				type="password"
				bind:value={password}
				required
			/>
		</div>
		<button
			type="submit"
			class="w-full bg-black text-white py-2 rounded disabled:opacity-60"
			disabled={loading}
		>
			{#if loading}Signing in...{/if}
			{#if !loading}Sign in{/if}
		</button>
		<div class="text-center text-sm">
			Don't have an account?
			<a href="/signup" class="underline">Sign up</a>
		</div>
	</form>
</div>
