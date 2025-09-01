import { table } from '$lib/pocketbase/new/tables.svelte';
import type {
	BoardListsResponse,
	BoardsResponse,
	CardsResponse,
	LinksResponse
} from '$lib/pocketbase/pocketBaseTypes';
import type { ListWrapper } from '$lib/pocketbase/new/table.svelte';
import { userState } from '$lib/state/userState.svelte';

export async function getUserPromise() {
	// Ensure PocketBase auth store has had a chance to initialize from localStorage
	await Promise.resolve();
}

class kanbanStateClass {
	boards: ListWrapper<BoardsResponse> = table.boards.getList(1, 200, {
		filter: `userId = "${userState.userId}"`
	});
	cards: ListWrapper<CardsResponse> = table.cards.getList(1, 200, {
		filter: `userId = "${userState.userId}"`
	});
	lists: ListWrapper<BoardListsResponse> = table.boardLists.getList(1, 200, {
		filter: `userId = "${userState.userId}"`
	});
	links: ListWrapper<LinksResponse> = table.links.getList(1, 200, {
		filter: `userId = "${userState.userId}"`
	});

	constructor() {}
}

export const kanbanState = new kanbanStateClass();
