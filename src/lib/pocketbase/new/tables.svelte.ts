import { tableWrapper } from './table.svelte';
import {
	type BoardListsResponse,
	type BoardsResponse,
	type CardsResponse,
	type UsersResponse,
	type LinksResponse
} from '../pocketBaseTypes';

export const table = {
	users: tableWrapper<UsersResponse>('users'),
	boardLists: tableWrapper<BoardListsResponse>('boardLists'),
	boards: tableWrapper<BoardsResponse>('boards'),
	cards: tableWrapper<CardsResponse>('cards'),
	links: tableWrapper<LinksResponse>('links')
};
