import { dev } from '$app/environment';
import type { Router } from '$lib/trpc/trpcAll';
import { createTRPCClient, type TRPCClientInit } from 'trpc-sveltekit';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import fetchPonyfill from 'fetch-ponyfill';

export const fetchUrl = (url: string) => {
	if (url.startsWith('http')) {
		return url;
	}

	if (dev) {
		return url;
	}
	// return url;
	return 'https://becomefearless.app' + url;
};

let browserClient: ReturnType<typeof createTRPCClient<Router>>;

export function trpc(init?: TRPCClientInit) {
	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && browserClient) return browserClient;

	const client = createTRPCClient<Router>({
		links: [
			// Send JWT to server through authorization header
			httpBatchLink({
				// fetch: fetchPonyfill().fetch,
				url: dev ? '/trpc' : fetchUrl('/trpc'),
				headers: () => {
					return { Authorization: 'Bearer ' + localStorage.getItem('token') };
				}

				// fetch(url, options) {
				// 	return fetch(url, {
				// 		...options,
				// 		credentials: 'include'
				// 	});
				// },
				/** headers are called on every request */
				// headers: () => {
				// 	// return {};
				// 	return { ...getAuthHeaders() };
				// }
			})
		]
	});
	if (isBrowser) browserClient = client;
	return client;
}
