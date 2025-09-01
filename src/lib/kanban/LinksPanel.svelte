<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { kanbanState } from './kanbanState.svelte';
	import type { Row } from '$lib/pocketbase/new/row.svelte';
	import type { LinksResponse } from '$lib/pocketbase/pocketBaseTypes';
	import { table } from '$lib/pocketbase/new/tables.svelte';
	import { userState } from '$lib/state/userState.svelte';

	let linksSorted = $derived(
		kanbanState.links.list
			.slice()
			.sort((a, b) => ((a.state as any).order || 0) - ((b.state as any).order || 0))
	);
	let items: Array<{ id: string; row: Row<LinksResponse> }> = $state([]);
	$effect(() => {
		items = linksSorted.map((r) => ({ id: r.id, row: r }));
	});

	let isDragging = $state(false);

	function handleConsider(e: CustomEvent) {
		const { items: its } = e.detail;
		items = its;
		isDragging = true;
	}
	async function handleFinalize(e: CustomEvent) {
		const { items: its } = e.detail;
		const updates = its.map((it: any, index: number) => {
			const row = it.row as Row<LinksResponse>;
			return row.update({ order: index } as any);
		});
		await Promise.all(updates);
		isDragging = false;
	}

	// Trash drop zone managed via the action button area
	let trashItems: Array<{ id: string; row: Row<LinksResponse> }> = $state([]);
	function handleTrashConsider(e: CustomEvent) {
		const { items: its } = e.detail;
		trashItems = its;
		isDragging = true;
	}
	async function handleTrashFinalize(e: CustomEvent) {
		const { items: its } = e.detail;
		isDragging = false;
		setTimeout(async () => {
			// const rows = its.map((it: any) => it.row as Row<LinksResponse>);
			// await Promise.all(rows.map((r) => table.links.delete(r.id)));
			its[0].row.delete();
			// table.links.delete(its[0].row.id);
			trashItems = [];
		}, 2000);
	}

	// Add link modal state
	let showModal = $state(false);
	let draftName = $state('');
	let draftEmoji = $state('🔗');
	let draftUrl = $state('');

	async function addLink() {
		const name = (draftName || '').trim() || 'Link';
		const emoji = (draftEmoji || '').trim() || '🔗';
		const link = (draftUrl || '').trim();
		if (!link) {
			showModal = false;
			return;
		}
		const maxOrder = Math.max(0, ...linksSorted.map((l) => l.state.order || 0));
		await table.links.create({
			name,
			emoji,
			link,
			order: maxOrder + 1,
			userId: userState.userId
		} as any);
		draftName = '';
		draftEmoji = '🔗';
		draftUrl = '';
		showModal = false;
	}
</script>

<!-- Side panel container -->
<div class="fixed inset-y-0 right-0 z-50 w-16">
	<div
		class="h-full bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 shadow-xl p-2 flex flex-col gap-2 items-center"
	>
		<div class="flex items-center justify-center w-full">
			<button
				class="w-10 h-10 border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
				onclick={() => (showModal = true)}
				aria-label="Add link"
			>
				+
			</button>
		</div>

		<!-- Reorderable list of links -->
		<div
			class="flex flex-col items-center gap-2 overflow-y-auto flex-1 w-full"
			use:dndzone={{ items, type: 'links', dropFromOthersDisabled: false, dragDisabled: false, flipDurationMs: 150, dropAnimationDisabled: true }}
			onconsider={handleConsider}
			onfinalize={handleFinalize}
		>
			{#each items as item (item.id)}
				<a
					href={item.row.state.link || '#'}
					target="_blank"
					rel="noreferrer"
					title={item.row.state.name || item.row.state.link || 'Link'}
					class="w-10 h-10 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 hover:cursor-pointer active:bg-gray-100 dark:hover:bg-neutral-800 cursor-grab active:cursor-grabbing grid place-items-center text-xl"
				>
					<span class="leading-none">{item.row.state.emoji || '🔗'}</span>
					<span class="sr-only">{item.row.state.name || item.row.state.link || 'Link'}</span>
				</a>
			{/each}
		</div>
	</div>
</div>

{#if isDragging}
	<!-- Floating trash dropzone -->
	<div class="fixed bottom-4 right-4 z-[60]">
		<div
			class="w-28 h-28 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 grid place-items-center shadow-lg"
			use:dndzone={{ items: trashItems, type: 'links', dropFromOthersDisabled: false, dragDisabled: true, flipDurationMs: 0, dropAnimationDisabled: true }}
			onconsider={handleTrashConsider}
			onfinalize={handleTrashFinalize}
		>
			🗑️ Drop to delete
		</div>
	</div>
{/if}

{#if showModal}
	<!-- Simple modal overlay -->
	<div
		class="fixed inset-0 z-[60] bg-black/30 dark:bg-black/60 flex items-center justify-center"
		onclick={() => (showModal = false)}
	>
		<div
			class="bg-white dark:bg-neutral-900 dark:text-white rounded-lg shadow border border-gray-200 dark:border-neutral-800 p-4 w-[90vw] max-w-sm"
			onclick={(e) => e.stopPropagation()}
		>
			<div class="font-semibold mb-3">Add link</div>
			<div class="flex flex-col gap-3">
				<div class="flex items-center gap-2">
					<label class="w-16 text-sm text-gray-600 dark:text-gray-300">Emoji</label>
					<input class="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40" placeholder="🔗" bind:value={draftEmoji} />
				</div>
				<div class="flex items-center gap-2">
					<label class="w-16 text-sm text-gray-600 dark:text-gray-300">Name</label>
					<input
						class="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40"
						placeholder="My link"
						bind:value={draftName}
					/>
				</div>
				<div class="flex items-center gap-2">
					<label class="w-16 text-sm text-gray-600 dark:text-gray-300">URL</label>
					<input
						class="flex-1 px-2 py-1 rounded border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40"
						placeholder="https://example.com"
						bind:value={draftUrl}
					/>
				</div>
				<div class="flex justify-end gap-2 mt-2">
					<button class="px-3 py-1 rounded border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700" onclick={() => (showModal = false)}
						>Cancel</button
					>
					<button class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/40" onclick={addLink}>Add</button>
				</div>
			</div>
		</div>
	</div>
{/if}