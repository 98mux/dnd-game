// import konstaConfig config
import konstaConfig from 'konsta/config';

// wrap config with konstaConfig config
export default konstaConfig({
	konstra: {
		colors: {
			// "primary" is the main app color, if not specified will be default to '#007aff'
			primary: '#007aff',
			// custom colors used for Konsta UI components theming
			'brand-red': '#ff0000',
			'brand-green': '#00ff00',
			light: '#ff864b',
			DEFAULT: '#ff6b22',
			dark: '#f85200'
		}
	},
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class', // or 'class'
	theme: {
		extend: {
			screens: {
				'h-sm': { raw: '(max-height: 600px)' },
				'h-md': { raw: '(max-height: 800px)' },
				'h-lg': { raw: '(min-height: 801px)' }
			},
			animation: {
				'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear'
			},
			keyframes: {
				'border-beam': {
					'100%': {
						'offset-distance': '100%'
					}
				}
			}
		}
	},
	variants: {
		extend: {}
	},
	plugins: [require('@tailwindcss/typography')]
});

// // import konstaConfig config
// import konstaConfig from 'konsta/config';
// // const konstaConfig = require('konsta/config');

// // wrap config with konstaConfig config
// // module.exports = konstaConfig({
// /** @type {import('tailwindcss').Config} */
// export default konstaConfig({
// 	content: ['./src/**/*.{html,js,svelte,ts}'],
// 	darkMode: 'media', // or 'class'
// 	theme: {
// 		extend: {}
// 	},
// 	variants: {
// 		extend: {}
// 	},
// 	plugins: []
// });
