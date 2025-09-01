import { trpcGame } from '$lib/trpc/server/trpcGame';
import { trpcUser } from '$lib/trpc/server/trpcUsers';
import { t } from './t';
import { trpcGeneration } from '$lib/trpc/server/trpcGeneration';
export const router = t.router({
	game: trpcGame,
	users: trpcUser,
	generation: trpcGeneration
});

export type Router = typeof router;
