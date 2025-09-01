<script lang="ts">
	import { onMount } from 'svelte';
	import { LocalStorageDB } from './localStorageDb';

	const store = new LocalStorageDB('testDB');

	let items: { key: string; value: string }[] = [];
	let newKey = '';
	let newValue = '';

	async function refresh() {
		const keys = await store.keys();

		console.log('REFRESHING', keys);
		items = [];

		for (const key of keys) {
			const value = await store.get(key);
			console.log('REFRESHING', key, value);
			items = [...items, { key, value: JSON.stringify(value) }];
		}
	}

	async function addItem() {
		if (!newKey || !newValue) return;

		console.log('ADDING ITEM 1');
		try {
			const parsed = JSON.parse(newValue);
			await store.set(newKey, parsed);
		} catch {
			await store.set(newKey, newValue);
		}

		newKey = '';
		newValue = '';
		await refresh();
	}

	async function deleteItem(key: string) {
		await store.remove(key);
		await refresh();
	}

	async function clearAll() {
		await store.clear();
		await refresh();
	}

	onMount(refresh);
</script>

<div class="mt-4-safe mx-4">
	<h2 class="text-xl font-bold mb-2">LocalStore Test</h2>

	<div class="flex gap-2 mb-4">
		<input bind:value={newKey} placeholder="Key" class="border p-2 rounded w-1/3" />
		<input
			bind:value={newValue}
			placeholder="Value (JSON or string)"
			class="border p-2 rounded w-2/3"
		/>
		<button on:click={addItem} class="bg-blue-500 text-white px-3 py-2 rounded">Add</button>
	</div>

	{#if items.length === 0}
		<p class="text-gray-500">No items found.</p>
	{:else}
		<ul class="mb-4">
			{#each items as item}
				<li class="mb-2 border rounded p-2">
					<div class="flex justify-between items-center">
						<div>
							<strong>{item.key}</strong>: <code>{item.value}</code>
						</div>
						<button on:click={() => deleteItem(item.key)} class="text-red-600 text-sm"
							>Delete</button
						>
					</div>
				</li>
			{/each}
		</ul>

		<button on:click={clearAll} class="bg-red-500 text-white px-3 py-2 rounded">Clear All</button>
	{/if}
</div>
