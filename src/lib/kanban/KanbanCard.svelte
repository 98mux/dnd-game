<script lang="ts">
	import type { Row } from '$lib/pocketbase/new/row.svelte';
	import type { CardsResponse } from '$lib/pocketbase/pocketBaseTypes';

	let { row }: { row: Row<CardsResponse> } = $props();

	let isEditing = $state(false);
	let draftText = $state('');
	let textareaEl = $state<HTMLTextAreaElement | null>(null);

	function resizeTextarea(textarea: HTMLTextAreaElement) {
		textarea.style.height = 'auto';
		textarea.style.height = `${textarea.scrollHeight}px`;
	}

	// Pointer interaction state for drag-first then edit-on-tap behavior
	let isPointerDown = $state(false);
	let pointerStartX = $state(0);
	let pointerStartY = $state(0);
	let pointerMoved = $state(false);
	const DRAG_THRESHOLD_PX = 5; // any movement beyond this counts as a drag

	$effect(() => {
		if (!isEditing) {
			draftText = row.state.text || '';
		}
	});

	$effect(() => {
		if (isEditing && textareaEl) {
			resizeTextarea(textareaEl);
		}
	});

	async function saveText() {
		const trimmed = (draftText || '').trim();
		row.update({ text: trimmed });
		isEditing = false;
	}

	function handlePointerDown(e: PointerEvent) {
		if (isEditing) return; // don't interfere while editing
		isPointerDown = true;
		pointerMoved = false;
		pointerStartX = e.clientX;
		pointerStartY = e.clientY;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isPointerDown || isEditing) return;
		const dx = e.clientX - pointerStartX;
		const dy = e.clientY - pointerStartY;
		if (!pointerMoved && dx * dx + dy * dy > DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
			pointerMoved = true; // this will allow the dndzone to take over; we won't enter edit
		}
	}

	function handlePointerUp() {
		if (isEditing) return;
		const wasTapWithoutMove = isPointerDown && !pointerMoved;
		isPointerDown = false;
		pointerMoved = false;
		if (wasTapWithoutMove) {
			isEditing = true;
		}
	}

	// let textareaEl: HTMLTextAreaElement | null = null;
	$effect(() => {
		if (isEditing && textareaEl) {
			// Delay focus to ensure element is in DOM
			setTimeout(() => {
				textareaEl?.focus();
				// Place caret at end
				const len = textareaEl?.value?.length ?? 0;
				textareaEl?.setSelectionRange?.(len, len);
			}, 0);
		}
	});
</script>

<div
	class="bg-white dark:bg-neutral-800 overflow-hidden text-black dark:text-white rounded-md shadow p-2 border border-gray-200 dark:border-neutral-700 w-64 max-w-[16rem]"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
	onpointercancel={() => {
		isPointerDown = false;
		pointerMoved = false;
	}}
	style="touch-action: manipulation;"
>
	{#if isEditing}
		<textarea
			class="w-full text-sm outline-none resize-none overflow-hidden bg-transparent text-inherit"
			rows="3"
			bind:value={draftText}
			bind:this={textareaEl}
			autofocus
			oninput={() => textareaEl && resizeTextarea(textareaEl)}
			onblur={saveText}
			onkeydown={(e) => {
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					saveText();
				} else if (e.key === 'Escape') {
					isEditing = false;
					draftText = row.state.text || '';
				}
			}}
			placeholder="Write a card..."
		/>
	{:else}
		<div
			class="text-left text-sm whitespace-pre-wrap break-words w-full cursor-grab active:cursor-grabbing"
			role="button"
			tabindex="0"
			onkeydown={(e: KeyboardEvent) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					isEditing = true;
				}
			}}
		>
			{row.state.text || 'Untitled'}
		</div>
	{/if}
</div>
