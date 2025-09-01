import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const corsHeaders = {
	'Access-Control-Allow-Credentials': 'true',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,DELETE,OPTIONS',

	'Access-Control-Allow-Headers':
		'Authorization, x-client-info, apikey, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
};

const CORSPreflight: Handle = async ({ event, resolve }) => {
	if (event.request.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	const response = await resolve(event);
	return response;
};

const CORSHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	// const newHeaders = new Headers(response.headers);
	// for (const [key, value] of Object.entries(corsHeaders)) {
	// 	newHeaders.set(key, value);
	// }

	for (const [key, value] of Object.entries(corsHeaders)) {
		response.headers.set(key, value);
	}
	return response;
};
// import { createContext } from '$lib/trpc/context';
// import { router } from '$lib/trpc/trpcAll';
import { createTRPCHandle } from 'trpc-sveltekit';

// const trpcHandle: Handle = createTRPCHandle({
// 	router,
// 	createContext,
// 	onError: ({ type, path, error }) =>
// 		console.error(`Encountered error while trying to process ${type} @ ${path}:`, error)
// });

// export const handle = sequence(CORSPreflight, CORSHeaders, trpcHandle, CORSHeaders, CORSHeaders);
export const handle = sequence(CORSPreflight, CORSHeaders, CORSHeaders, CORSHeaders);
