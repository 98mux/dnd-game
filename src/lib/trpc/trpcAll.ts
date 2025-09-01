import { trpcGame } from '$lib/trpc/server/trpcGame';
import { trpcUser } from '$lib/trpc/server/trpcUsers';
import { t } from './t';
export const router = t.router({
	game: trpcGame,
	users: trpcUser
});

export type Router = typeof router;
