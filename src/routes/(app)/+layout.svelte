<script lang="ts">
	import App from '$lib/app/App.svelte';
	import { goto } from '$app/navigation';
	import { userState } from '$lib/state/userState.svelte';
	import { pb } from '$lib/pocketbase/pocketbase';
	import { onMount } from 'svelte';

	let { children } = $props();


	//test
	onMount(() => {
	const shouldRedirectToLogin = !pb.authStore.model?.id;
		if (shouldRedirectToLogin) {
			goto('/login');
		}
	});
</script>

<App>
	{@render children()}
</App>
