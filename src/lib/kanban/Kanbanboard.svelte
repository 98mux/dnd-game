<script lang="ts">
	import { dndzone } from 'svelte-dnd-action';
	import { table } from '$lib/pocketbase/new/tables.svelte';
	import type { Row } from '$lib/pocketbase/new/row.svelte';
	import type {
		BoardsResponse,
		BoardListsResponse,
		CardsResponse
	} from '$lib/pocketbase/pocketBaseTypes';
	import KanbanList from './KanbanList.svelte';
	import KanbanCard from './KanbanCard.svelte';
	import { kanbanState } from './kanbanState.svelte';
	import { userState } from '$lib/state/userState.svelte';
	import LinksPanel from './LinksPanel.svelte';
	import { userPreferences } from '$lib/state/userState.svelte';
 	import Portal from '$lib/utils/Portal.svelte';
 	import { Dialog } from '@capacitor/dialog';

	// Boards top bar state
	let boardsList = kanbanState.boards;
	let editingBoardId = $state<string | undefined>(undefined);
	let boardTitleDraft = $state('');

	// Board actions dropdown state
	let boardMenuOpen = $state(false);
	let boardMenuLeft = $state(0);
	let boardMenuTop = $state(0);
	let boardMenuForId = $state<string | undefined>(undefined);

	// Focus and select helper for inline inputs
	function autoselect(node: HTMLInputElement) {
		setTimeout(() => {
			try {
				node.focus();
				node.select();
			} catch (e) {
				/* no-op */
			}
		}, 0);
		return { destroy() {} };
	}

	// Sort boards by order and keep dnd items in sync
	let boardsSorted = $derived(
		boardsList.list
			.slice()
			.sort((a, b) => ((a.state as any).order || 0) - ((b.state as any).order || 0))
	);
	let boardsItems: Array<{ id: string; row: Row<BoardsResponse> }> = $state([]);
	$effect(() => {
		boardsItems = boardsSorted.map((b) => ({ id: b.id, row: b }));
	});

	// Derive current board id directly from preferences with fallback to first board
	const currentBoardId = $derived.by(() => {
		const selected = userPreferences.state.current.selectedBoardId;
		const found = boardsSorted.find((b) => b.id === selected)?.id;
		return found ?? boardsSorted[0]?.id;
	});

	function setActiveBoard(id: string) {
		userPreferences.state.current.selectedBoardId = id;
	}

	function openBoardMenuForEvent(e: MouseEvent, id: string) {
		e.stopPropagation();
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const menuWidth = 180;
		const margin = 8;
		let left = Math.min(
			Math.max(margin, rect.right - menuWidth),
			window.innerWidth - margin - menuWidth
		);
		let top = Math.min(rect.bottom + 6, window.innerHeight - margin - 40);
		boardMenuLeft = left;
		boardMenuTop = top;
		boardMenuForId = id;
		boardMenuOpen = true;
	}

	function closeBoardMenu() {
		boardMenuOpen = false;
		boardMenuForId = undefined;
	}

	$effect(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') {
				closeBoardMenu();
			}
		}
		if (boardMenuOpen) {
			document.addEventListener('keydown', onKey);
			return () => document.removeEventListener('keydown', onKey);
		}
		return () => {};
	});

	async function deleteBoard(boardId: string) {
		closeBoardMenu();
		let confirmResult: { value: boolean } | undefined;
		try {
			confirmResult = await Dialog.confirm({
				title: 'Delete board',
				message: 'Delete this board? This cannot be undone.'
			});
		} catch (e) {
			const ok = typeof window !== 'undefined'
				? window.confirm('Delete this board? This cannot be undone.')
				: false;
			confirmResult = { value: ok };
		}
		if (!confirmResult?.value) return;

		// Compute a fallback selection before deletion
		const idx = boardsSorted.findIndex((b) => b.id === boardId);
		const remaining = boardsSorted.filter((b) => b.id !== boardId);
		const fallback = remaining[idx]?.id ?? remaining[idx - 1]?.id ?? remaining[0]?.id;

		await table.boards.delete(boardId);
		if (userPreferences.state.current.selectedBoardId === boardId) {
			userPreferences.state.current.selectedBoardId = fallback;
		}
	}

	async function createBoard() {
		const maxOrder = Math.max(0, ...boardsSorted.map((b) => (b.state as any).order || 0));
		const newRow = await table.boards.create({
			title: 'New board',
			userId: userState.userId,
			order: maxOrder + 1
		} as any);
		userPreferences.state.current.selectedBoardId = newRow.id;
		editingBoardId = newRow.id;
		boardTitleDraft = 'New board';

		// Create a default list and a default card in that list
		const defaultList = await table.boardLists.create({
			boardId: newRow.id,
			title: 'New list',
			order: 0,
			userId: userState.userId
		} as any);
		await table.cards.create({
			text: 'New card',
			boardId: newRow.id,
			boardListId: defaultList.id,
			order: 0,
			completed: false,
			readyToTest: false,
			userId: userState.userId
		} as any);
	}

	async function renameBoard(row: Row<BoardsResponse>) {
		const t = (boardTitleDraft || '').trim() || 'Untitled';
		row.update({ title: t });
		editingBoardId = undefined;
	}

	function handleBoardsConsider(e: CustomEvent) {
		const { items } = e.detail;
		boardsItems = items;
	}
	function moveBoards(e: CustomEvent) {
		const { items } = e.detail;
		const updates = items.map((it: any, idx: number) => {
			const row = it.row as Row<BoardsResponse>;
			return row.update({ order: idx } as any);
		});
		Promise.all(updates);
	}

	// Lists for current board (recreated when board changes)
	let lists = $derived(
		kanbanState.lists.list
			.filter((l) => l.state.boardId === currentBoardId)
			.sort((a, b) => (a.state.order || 0) - (b.state.order || 0))
	);
	let listsItems: Array<{ id: string; row: Row<BoardListsResponse> }> = $state([]);
	$effect(() => {
		listsItems = lists.map((l) => ({ id: l.id, row: l }));
	});

	async function createList() {
		if (!currentBoardId) return;
		const maxOrder = Math.max(0, ...lists.map((l) => l.state.order || 0));
		await table.boardLists.create({
			boardId: currentBoardId,
			title: 'New list',
			order: maxOrder + 1,
			userId: userState.userId
		} as any);
	}

	// Cards per list (items arrays kept in sync with lists)
	let cardsForLists: Record<string, Array<{ id: string; row: Row<CardsResponse> }>> = $state({});
	$effect(() => {
		const presentIds: Set<string> = new Set();
		for (const l of lists) {
			presentIds.add(l.id);
			const rows = kanbanState.cards.list
				.filter(
					(c) =>
						c.state.boardId === currentBoardId &&
						c.state.boardListId === l.id &&
						!c.state.completed &&
						!c.state.readyToTest
				)
				.sort((a, b) => (a.state.order || 0) - (b.state.order || 0));
			cardsForLists[l.id] = rows.map((r) => ({ id: r.id, row: r }));
		}
		for (const id in cardsForLists) {
			if (!presentIds.has(id)) delete cardsForLists[id];
		}
	});

	function handleListCardsConsider(listId: string, e: CustomEvent) {
		const { items } = e.detail;
		cardsForLists[listId] = items;
		isDraggingCard = true;
	}

	// Ready to test area
	let cardsReadyToTest = $derived(
		kanbanState.cards.list
			.filter(
				(c) => c.state.readyToTest && !c.state.completed && c.state.boardId === currentBoardId
			)
			.sort((a, b) => (a.state.order || 0) - (b.state.order || 0))
	);
	let readyItems: Array<{ id: string; row: Row<CardsResponse> }> = $state([]);
	$effect(() => {
		readyItems = cardsReadyToTest.map((r) => ({ id: r.id, row: r }));
	});

	// Completed area
	let cardsCompleted = $derived(
		kanbanState.cards.list
			.filter((c) => c.state.completed && c.state.boardId === currentBoardId)
			.sort((a, b) => (a.state.order || 0) - (b.state.order || 0))
	);
	let completedItems: Array<{ id: string; row: Row<CardsResponse> }> = $state([]);
	$effect(() => {
		completedItems = cardsCompleted.map((r) => ({ id: r.id, row: r }));
	});
	let showCompleted = $state(false);
	let isDraggingCard = $state(false);
	let showTesting = $state(true);
	// const completedOpen = $derived(showCompleted || isDraggingCard);
	// const testingOpen = $derived(showTesting || isDraggingCard);
	const completedOpen = $derived(true);
	const testingOpen = $derived(true);

	const completedCountForBoard = $derived(cardsCompleted.length);

	// Total completed across all boards
	const allCompleted = $derived(kanbanState.cards.list.filter((c) => c.state.completed));
	const completedTotal = $derived(allCompleted.length);

	// DnD handlers
	function handleListCardsFinalize(listId: string, e: CustomEvent) {
		const { items } = e.detail;
		const toUpdate: Array<Promise<any>> = [];
		items.forEach((it: any, index: number) => {
			const row = it.row as Row<CardsResponse>;
			toUpdate.push(
				row.update({
					order: index,
					boardListId: listId,
					boardId: currentBoardId,
					readyToTest: false,
					completed: false
				} as any)
			);
		});
		Promise.all(toUpdate);
		isDraggingCard = false;
	}

	function handleReadyConsider(e: CustomEvent) {
		const { items } = e.detail;
		readyItems = items;
		isDraggingCard = true;
	}
	async function handleReadyFinalize(e: CustomEvent) {
		const { items } = e.detail;
		const updates = items.map((it: any, index: number) => {
			const row = it.row as Row<CardsResponse>;
			return row.update({
				readyToTest: true,
				completed: false,
				order: index,
				boardId: currentBoardId
			} as any);
		});
		await Promise.all(updates);
		isDraggingCard = false;
	}

	function handleCompletedConsider(e: CustomEvent) {
		const { items } = e.detail;
		completedItems = items;
		isDraggingCard = true;
	}
	async function handleCompletedFinalize(e: CustomEvent) {
		const { items } = e.detail;
		const updates = items.map((it: any) => {
			const row = it.row as Row<CardsResponse>;
			return row.update({ completed: true, readyToTest: false, boardId: currentBoardId } as any);
		});
		await Promise.all(updates);
		isDraggingCard = false;
	}

	function cardToDndItem(row: Row<CardsResponse>) {
		return { id: row.id, row };
	}

	function handleListsConsider(e: CustomEvent) {
		const { items } = e.detail;
		listsItems = items;
	}
	function moveLists(e: CustomEvent) {
		const { items } = e.detail;
		const updates = items.map((it: any, idx: number) => {
			const row = it.row as Row<BoardListsResponse>;
			return row.update({ order: idx } as any);
		});
		Promise.all(updates);
	}
</script>

<div class="flex flex-col gap-3 p-8 h-[100vh] pr-14">
	<!-- Boards top nav -->
	<div class="flex items-center gap-2 overflow-x-auto hide-scrollbar flex-shrink-0">
		<div
			class="flex items-center gap-2"
			use:dndzone={{
				items: boardsItems,
				flipDurationMs: 150,
				type: 'boards',
				dragDisabled: false,
				dropFromOthersDisabled: true
			}}
			onconsider={handleBoardsConsider}
			onfinalize={moveBoards}
		>
			{#each boardsItems as item (item.id)}
				<div
					class="px-3 py-1 rounded-full {currentBoardId === item.id
						? userPreferences.state.current.darkMode
							? '!bg-blue-800'
							: '!bg-blue-200'
						: ''} border whitespace-nowrap mr-1 bg-white dark:bg-neutral-800 text-black dark:text-white dark:border-neutral-700 inline-flex items-center gap-1"
					role="button"
					tabindex="0"
					onclick={() => setActiveBoard(item.id)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') setActiveBoard(item.id);
					}}
					ondblclick={() => {
						editingBoardId = item.id;
						boardTitleDraft = item.row.state.title || '';
					}}
					oncontextmenu={(e) => {
						e.preventDefault();
						editingBoardId = item.id;
						boardTitleDraft = item.row.state.title || '';
					}}
				>
					{#if editingBoardId === item.id}
						<input
							class="px-2 py-0.5 rounded border bg-transparent text-inherit"
							bind:value={boardTitleDraft}
							onblur={() => renameBoard(item.row)}
							onkeydown={(e) => {
								if (e.key === 'Enter') renameBoard(item.row);
								if (e.key === 'Escape') editingBoardId = undefined;
							}}
							autofocus
							use:autoselect
						/>
					{:else}
						<span class="truncate max-w-[12rem]">{item.row.state.title || 'Untitled'}</span>
						{#if currentBoardId === item.id}
							<button
								class="ml-1 px-1.5 py-0.5 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
								aria-label="Board actions"
								onclick={(e) => openBoardMenuForEvent(e, item.id)}
							>
								⋮
							</button>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
		<button
			class="px-3 py-1 rounded-full border flex-shrink-0 bg-white dark:bg-neutral-800 text-black dark:text-white dark:border-neutral-700"
			onclick={createBoard}>+ New Board</button
		>
	</div>

	<!-- Lists row with DnD for lists -->
	<div class="flex gap-3 overflow-x-auto hide-scrollbar flex-grow flex-shrink-0 pb-2">
		<div
			class="flex gap-3"
			use:dndzone={{
				items: listsItems,
				flipDurationMs: 150,
				type: 'lists',
				dragDisabled: false,
				dropFromOthersDisabled: false
			}}
			onconsider={handleListsConsider}
			onfinalize={moveLists}
		>
			{#each listsItems as item (item.id)}
				<div class="shrink-0">
					<KanbanList
						listRow={item.row}
						items={cardsForLists[item.id] || []}
						consider={(e) => handleListCardsConsider(item.id, e)}
						finalize={(e) => handleListCardsFinalize(item.id, e)}
						addCard={async (text: string) => {
							const maxOrder = Math.max(0, ...(cardsForLists[item.id] || []).map((c) => c.row.state.order || 0));
							await table.cards.create({
								text: text,
								boardId: currentBoardId,
								boardListId: item.id,
								order: maxOrder + 1,
								completed: false,
								readyToTest: false,
								userId: userState.userId
							} as any);
						}}
					/>
				</div>
			{/each}
		</div>

		<!-- Add list button (outside dnd zone to keep invariants) -->
		<button
			class="w-72 shrink-0 h-min self-start px-3 py-2 border rounded-lg bg-white dark:bg-neutral-800 text-black dark:text-white dark:border-neutral-700"
			onclick={createList}
		>
			+ Add list
		</button>
	</div>

	<!-- Bottom dock: Testing Stage + Completed -->
	<div
		class="fixed inset-x-0 bottom-0-safe z-40 p-4 pt-2 bg-gradient-to-t from-white dark:from-black to-white dark:to-black"
	>
		<div class="">
			<!-- Testing Stage -->
			<div class="">
				<button
					class="font-semibold mb-2 flex items-center gap-2 p-2"
					class:pointer-events-none={isDraggingCard}
					onclick={() => (showTesting = !showTesting)}
				>
					🧪 Testing Stage
					<!-- <span class="text-xs text-gray-500">{showTesting ? 'Hide' : 'Show'}</span> -->
				</button>
				{#if testingOpen}
					<div
						class="flex gap-3 overflow-x-auto hide-scrollbar p-4 pt-8 -mt-12 h-20 rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50/60 dark:bg-neutral-900/60 w-full"
						use:dndzone={{
							items: readyItems,
							flipDurationMs: 150,
							type: 'cards',
							dragDisabled: false,
							dropFromOthersDisabled: false,
							dropAnimationDisabled: true
						}}
						onconsider={handleReadyConsider}
						onfinalize={handleReadyFinalize}
					>
						{#each readyItems as item (item.id)}
							<div class="flex-shrink-0">
								<KanbanCard row={item.row} />
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Completed -->
			<div class="-mt-4">
				<button
					class="font-semibold mb-2 flex items-center gap-2 p-2 pt-8"
					class:pointer-events-none={isDraggingCard}
					onclick={() => (showCompleted = !showCompleted)}
				>
					✅ {completedCountForBoard} Completed
					<span class="text-xs text-gray-500">Total {completedTotal}</span>
					<!-- <span class="text-xs text-gray-500">{showCompleted ? 'Hide' : 'Show'}</span> -->
				</button>
				{#if completedOpen}
					<div
						class="flex gap-3 overflow-x-auto hide-scrollbar p-4 pt-8 -mt-12 h-20 rounded-lg border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50/60 dark:bg-neutral-900/60 w-full"
						use:dndzone={{
							items: completedItems,
							flipDurationMs: 150,
							type: 'cards',
							dragDisabled: false,
							dropFromOthersDisabled: false,
							dropAnimationDisabled: true
						}}
						onconsider={handleCompletedConsider}
						onfinalize={handleCompletedFinalize}
					>
						{#each completedItems as item (item.id)}
							<div class=" flex-shrink-0">
								<KanbanCard row={item.row} />
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<LinksPanel />

	{#if boardMenuOpen && boardMenuForId}
		<Portal target={'body'}>
			<div class="fixed inset-0 z-50" onclick={closeBoardMenu}>
				<div
					class="absolute z-50 bg-white dark:bg-neutral-800 text-black dark:text-white border dark:border-neutral-700 rounded shadow w-44 py-1"
					style={`top: ${boardMenuTop}px; left: ${boardMenuLeft}px;`}
					onclick={(e) => e.stopPropagation()}
				>
					<button
						class="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-neutral-700 text-red-600"
						onclick={() => boardMenuForId && deleteBoard(boardMenuForId)}
					>
						Delete board
					</button>
				</div>
			</div>
		</Portal>
	{/if}
</div>
