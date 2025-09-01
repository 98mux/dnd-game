<script lang="ts">
	import { onMount } from 'svelte';
	import { trpc } from '$lib/trpc/client';

	let result = $state('No result yet');
	onMount(async () => {
		const result2 = await trpc().game.test.mutate();
		result = result2.message;
	});
</script>

hello world
{result}
