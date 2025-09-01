import adapter from '@sveltejs/adapter-static'
import preprocess from "svelte-preprocess";
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import vercel from '@sveltejs/adapter-vercel';
// import cloudflare from '@sveltejs/adapter-cloudflare';
// import netlify from '@sveltejs/adapter-netlify';
import {breferPreprocess} from 'peltejs';


const isVercel = process.env.IS_VERCEL === 'true';
const isCloudflare = process.env.IS_CLOUDFLARE === 'true';
const isNetlify = process.env.IS_NETLIFY === 'true';


/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess()],

	kit: {
		adapter: isNetlify ? netlify({maxDuration:300}) : isCloudflare ? cloudflare({maxDuration:300}) : isVercel ? vercel({maxDuration:300}) : adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			// fallback: '200.html',
			precompress: false
		}),
	},
};

export default config;
