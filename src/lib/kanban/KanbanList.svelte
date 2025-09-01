<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import type { Row } from '$lib/pocketbase/new/row.svelte';
	import type { BoardListsResponse, CardsResponse } from '$lib/pocketbase/pocketBaseTypes';
	import KanbanCard from './KanbanCard.svelte';
	import { table } from '$lib/pocketbase/new/tables.svelte';

	let {
		listRow,
		items = [],
		cards = [],
		editableTitle = true,
		addCard = () => {},
		consider = () => {},
		finalize = () => {}
	}: {
		listRow: Row<BoardListsResponse>;
		items?: Array<any>;
		cards?: Array<Row<CardsResponse>>;
		editableTitle?: boolean;
		addCard?: (text: string) => void;
		consider?: (e: CustomEvent) => void;
		finalize?: (e: CustomEvent) => void;
	} = $props();

	let newCardText = $state('');
	let editingTitle = $state(false);
	let draftTitle = $state('');
	let menuOpen = $state(false);

	$effect(() => {
		draftTitle = listRow.state.title || '';
	});

	$effect(() => {
		function onDocClick() {
			menuOpen = false;
		}
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	});

	async function addCard2() {
		const text = (newCardText || '').trim();
		if (!text) return;
		addCard(text);
		newCardText = '';
	}

	async function saveTitle() {
		const title = (draftTitle || '').trim() || 'Untitled';
		listRow.update({ title });
		editingTitle = false;
	}

	async function copyAllCards() {
		const texts: Array<string> = (items || [])
			.map((it: any) => ((it?.row?.state?.text || '') as string).trim())
			.filter((t: string) => t.length > 0);
		const formatted = texts.map((t, i) => `${i + 1}) ${t}`).join(' ');
		try {
			await navigator.clipboard.writeText(formatted);
		} catch (e) {
			/* no-op */
		}
		menuOpen = false;
	}

	async function deleteThisList() {
		if (typeof window !== 'undefined') {
			const ok = window.confirm('Delete this list? This cannot be undone.');
			if (!ok) return;
		}
		await table.boardLists.delete(listRow.id);
		menuOpen = false;
	}
</script>

<div
	class="w-72 shrink-0 bg-gray-50 dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-2 flex flex-col gap-2"
>
	<div class="flex items-center gap-2 relative">
		{#if editableTitle}
			{#if editingTitle}
				<input
					class="px-2 py-1 rounded border w-full"
					bind:value={draftTitle}
					onblur={saveTitle}
					onkeydown={(e) => {
						if (e.key === 'Enter') saveTitle();
						if (e.key === 'Escape') {
							editingTitle = false;
							draftTitle = listRow.state.title || '';
						}
					}}
				/>
			{:else}
				<div
					class="font-semibold px-1 py-1 w-full"
					onclick={() => (editingTitle = true)}
					role="button"
					tabindex="0"
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') editingTitle = true;
					}}
				>
					{listRow.state.title || 'Untitled'}
				</div>
			{/if}
		{:else}
			<div class="font-semibold px-1 py-1 w-full">{listRow.state.title || 'Untitled'}</div>
		{/if}

		<button
			class="px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
			aria-label="List actions"
			onclick={(e) => {
				e.stopPropagation();
				menuOpen = !menuOpen;
			}}>⋮</button
		>
		{#if menuOpen}
			<div
				class="absolute right-2 top-8 z-20 bg-white dark:bg-neutral-800 text-black dark:text-white border dark:border-neutral-700 rounded shadow w-40 py-1"
				onclick={(e) => e.stopPropagation()}
			>
				<button
					class="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-700"
					onclick={copyAllCards}>Copy all cards</button
				>
				<button
					class="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-700 text-red-600"
					onclick={deleteThisList}>Delete list</button
				>
			</div>
		{/if}
	</div>

	<div
		class="flex flex-col gap-2 min-h-6 max-h-[60vh] overflow-y-auto"
		use:dndzone={{
			items,
			type: 'cards',
			flipDurationMs: 150,
			dragDisabled: false,
			dropFromOthersDisabled: false,
			dropAnimationDisabled: true
		}}
		onconsider={(e) => consider(e)}
		onfinalize={(e) => finalize(e)}
	>
		{#each items as item (item.id)}
			<KanbanCard row={item.row} />
		{/each}
	</div>

	<div class="mt-1">
		<input
			class="w-full text-sm px-2 py-1 rounded border"
			placeholder="Add a card..."
			bind:value={newCardText}
			onkeydown={(e) => {
				if (e.key === 'Enter') addCard2();
			}}
			onblur={() => {
				/* no-op */
			}}
		/>
	</div>
</div>
