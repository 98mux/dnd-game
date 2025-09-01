import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit() /* For cloudflare */],
	ssr: {
		noExternal: 'framework7-icons'

		// [/^framework7-icons(?:-extra)?\//]
	},
	build: {
		target: 'esnext'
	}
	// server: {
	// 	hmr: false
	// }
	// optimizeDeps: { disabled: 'dev' }
});
