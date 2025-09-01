<script>
	import { goto } from '$app/navigation';
	import LocalStorageTester from '$lib/capacitorPlugins/LocalStorageTester.svelte';
</script>

<LocalStorageTester />

<button
	onclick={() => {
		goto('/');
	}}
>
	Go back
</button>
