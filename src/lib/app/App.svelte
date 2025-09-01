<script lang="ts">
	import '../../app.css';
	import { Toaster } from 'svelte-french-toast';
	import { App, Page } from 'konsta/svelte';
	import { onMount } from 'svelte';

	import AppSingletons from './AppSingletons.svelte';
	import { TextZoom } from '@capacitor/text-zoom';
	import { SplashScreen } from '@capacitor/splash-screen';
	import { initTheme } from '$lib/state/theme';
	import { userPreferences } from '$lib/state/userState.svelte';

	onMount(async () => {
		initTheme();
		await SplashScreen.hide();

		try {
			TextZoom.set({
				value: 1
			});
		} catch {}
	});
</script>

<svelte:window on:click={(e) => {}} />

<Toaster
	position="top-center"
	containerStyle="z-index: 2147483600 !important; font-weight:bold;
margin-top: calc(var(--k-safe-area-top) + 32px);"
/>

<div class="relative">
	<div
		id="background"
		class="absolute top-0 left-0 right-0 bottom-0 pointer-events-none"
		style="min-height:95vh"
	/>
	<App
		theme="ios"
		dark={userPreferences.state.current.darkMode}
		safeAreas
		class="!h-auto !block !static text-black dark:text-white bg-white dark:bg-neutral-900 min-h-[90vh]"
	>
		<Page
			class="!h-auto !block !static !overflow-x-hidden !overflow-y-auto bg-transparent dark:bg-transparent"
		>
			<div id="page" class="text-black dark:text-white">
				<AppSingletons />
				<slot />
			</div>
		</Page>
	</App>
</div>

<svelte:head>
	<!-- Roboto font for material design theme -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,700;1,400;1,500;1,700&display=swap"
		rel="stylesheet"
	/>
	<link
		href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<style global>
	@font-face {
		font-family: 'Inter';
		src: url('/app/Inter/Inter.ttf') format('truetype');
		font-weight: 100 900;
		font-style: normal;
	}

	/* Italic + Variable weights */
	@font-face {
		font-family: 'Inter';
		src: url('/app/Inter/InterItalic.ttf') format('truetype');
		font-weight: 100 900;
		font-style: italic;
	}

	* {
		user-select: none; /* Standard */
		-webkit-user-select: none; /* Safari */
		-ms-user-select: none; /* Old IE */
		touch-action: manipulation;
		overscroll-behavior: none;
		font-family: 'Inter', sans-serif !important;

		/* filter: none !important; */
	}

	img {
		user-select: none;
		-webkit-user-drag: none;
		-webkit-touch-callout: none; /* Prevents long-press save image on Safari */
	}

	/* Allow selection in input and textarea fields */
	input,
	textarea {
		user-select: text; /* Standard */
		-webkit-user-select: text; /* Safari */
		-ms-user-select: text; /* Old IE */
	}
	:global(.hide-scrollbar) {
		-ms-overflow-style: none; /* Internet Explorer 10+ */
		scrollbar-width: none; /* Firefox */
	}
	:global(.hide-scrollbar::-webkit-scrollbar) {
		display: none; /* Safari and Chrome */
		-webkit-appearance: none;
		width: 0;
		height: 0;
	}
	:global(input) {
		color: black;
		background-color: white;
	}
	:global(html.dark .k-input),
	:global(html.dark input),
	:global(html.dark textarea),
	:global(html.dark select) {
		color: white;
		background-color: #0b1220;
		border-color: #374151;
	}
	@font-face {
		font-family: 'capitalhill';
		src: url(https://becomefearless.app/fonts/Capital_Hill.ttf);
	}
	@font-face {
		font-family: 'capitalhillmonospace';
		src: url(https://becomefearless.app/fonts/Capital_Hill_Monospaced.ttf);
	}
	@font-face {
		font-family: 'm5x7';
		src: url(https://becomefearless.app/fonts/m5x7.ttf);
	}
	@font-face {
		font-family: 'monogram';
		src: url(https://becomefearless.app/fonts/monogram.ttf);
	}

	/* latin */
	:global(.pixelFont) {
		font-family: 'm5x7' !important;
		font-weight: normal;
		font-style: normal;
	}

	:global(.pixelFontBold) {
		font-family: 'm5x7' !important;
	}
	/* Dark mode form field overrides */
	:global(html.dark input),
	:global(html.dark textarea) {
		color: white;
		background-color: #111827;
	}
</style>
