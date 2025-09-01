import { validateJWT } from '$lib/trpc/server/trpcUsers';
import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';

function getUserIdFromHeaders(headers: any) {
	const jwt = headers.get('authorization');
	if (jwt) {
		const token = jwt.split(' ')[1];
		return validateJWT(token);
	}
	return undefined;
}

// we're not using the event parameter is this example,
// hence the eslint-disable rule
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createContext(event: RequestEvent) {
	const userId = getUserIdFromHeaders(event.request.headers);
	return { ...event, userId };
}

export type Context = inferAsyncReturnType<typeof createContext>;
