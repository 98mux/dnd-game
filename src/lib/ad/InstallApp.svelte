<script lang="ts">
	// import { pb } from '$lib/pocketbase/pocketbase';
	// import type { WebResponse } from '$lib/pocketbase/pocketBaseTypes';
	import { onMount } from 'svelte';

	import { page } from '$app/stores';

	let { onclick }: { onclick?: (fbclid: string) => void } = $props();

	let id2: string | undefined = $state(undefined);

	let appId = '6748984878';

	let appStoreUrl = `https://apps.apple.com/us/app/delete-cringe-photo-cleaner/id${appId}`;

	// let abtests: number = generateABTestString();
	let abtests = $page.data.abtests;
	// abtests = 4693575029136222;

	function isTest(test: number, number = abtests) {
		return (number & (1 << test)) >> test === 1;

		// return (n & (1 << number))
		// const binary = tobinaryString(abtests);
		// return binary[binary.length - n - 1] === '1';
	}

	function tobinaryString(n: number) {
		return n.toString(2); //.padStart(19, '0');
	}

	// let test0 = isTestn(0); //app store shake (14% increase)
	// let test1 = isTestn(1); //Learn button
	// let test2 = isTestn(2); // (22% reduction) No preview images
	// let test3 = isTestn(3); // Background color - darker (14% increase)
	// let test4 = isTestn(4); // (Previous Description - 23% reduction)
	// let test5 = isTestn(5); // Privacy policy
	// let test6 = isTestn(6); // Final call to action (14% increase)
	// let test7 = isTestn(7);

	let test0 = true; //isTest(0); // Learn button
	let test1 = false; //isTest(1); // Shake main button
	let test2 = true; //isTest(2); // "Tap to go to app store"
	let test3 = true; //isTest(3); // No bottom text
	let test4 = true; //isTest(4); // rounded button
	let test5 = false; //isTest(5); // outline
	let test6 = false; //isTest(6); // smaller
	let test7 = false; //isTest(7); // remove "Tap here to go to app store" for appstorepreview
	let test8 = false; //isTest(8); // Destroy everything
	// let test9 = false; //isTest(9); // experimental button
	let test9 = isTest(9); //isTest(9); // experimental button
	// let test9 = true; //isTest(9); // experimental button

	function getFbclid() {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get('fbclid');
	}

	function getOrCreateFbc() {
		const fbclid = getFbclid();
		if (!fbclid) return null; // No fbclid, no need to create _fbc

		const cookieName = '_fbc';
		const existingFbc = document.cookie.split('; ').find((row) => row.startsWith(cookieName + '='));

		if (existingFbc) {
			return existingFbc.split('=')[1]; // Use existing _fbc cookie value
		}

		// Create a new _fbc if it doesn't exist
		const creationTime = Date.now(); // Timestamp in milliseconds
		const fbc = `fb.1.${creationTime}.${fbclid}`;

		// Set the cookie (90-day expiry)
		document.cookie = `${cookieName}=${fbc}; path=/; max-age=${90 * 24 * 60 * 60}; SameSite=Lax`;

		return fbc;
	}

	// Generate _fbc only if it's not already set
	let fbc: string | undefined = undefined;

	async function initializeAnalytics() {
		if (!fbc) {
			fbc = getOrCreateFbc();
		}
		const fbclid = new URLSearchParams(window.location.search).get('fbclid');
		const name = new URLSearchParams(window.location.search).get('name');
		id2 = localStorage.getItem('id2') as string;
		if (id2) {
			// let n = await pb.collection('web').getOne(id2);
			// await pb.collection('web').update(id2, {
			// 	visitNumber: n.visitNumber + 1,
			// 	fbc: fbc,
			// 	name
			// });
		} else {
			let isInstagram = window.location.href.includes('ig');
			// let n = await pb.collection('web').create({
			// 	instagram: isInstagram,
			// 	abtests,
			// 	fbc: fbc,
			// 	name
			// });
			// id2 = n.id;
			// localStorage.setItem('id2', id2);
		}
	}

	function u(update: Partial<WebResponse>) {
		if (id2) {
			// pb.collection('web').update(id2, update);
		}
	}

	function install(e: MouseEvent, button: string) {
		if (e) {
			// e.preventDefault();
			e.stopPropagation();
		}

		u({
			tapInstall: true,
			button
		});

		// const fbclid = new URLSearchParams(window.location.search).get('fbclid');
		onclick?.(fbc);
		window.open(appStoreUrl, '_blank');
	}
	//Fake popup test
	//

	let scrolled = $state(false);
	onMount(() => {
		fbc = getOrCreateFbc();
		initializeAnalytics();
		window.addEventListener('scroll', () => {
			if (!scrolled) {
				u({
					scrolled: true
				});
				scrolled = true;
			}
			if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
				u({
					scrolledToBottom: true
				});
			}
		});
	});
</script>

<svelte:head>
	<meta name="apple-itunes-app" content={`app-id=${appId}`} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- <div
	class=" {!test3
		? 'bg-gradient-to-br from-purple-700 to-blue-700'
		: 'bg-gradient-to-br from-violet-900 to-blue-900'} p-6 text-white"
> -->
<div
	class="
		bg-gradient-to-br from-violet-900 to-blue-900 p-6 text-white"
	onclick={(e) => install(e, 'background')}
>
	<div class="poppins-black text-3xl text-white" style="font-size:2.2rem; line-height:1.4;">
		Instantly delete all your cringe photos from your phone
	</div>
	<div class="my-4" />

	<div class="text-2xl font-extralight" style="font-size:1.5rem;">
		Search for <b>"Delete Cringe"</b> on App Store!
	</div>
	<div class="flex justify-center items-center gap-4" onclick={(e) => install(e, 'appstore')}>
		<img
			src="https://fearless.city/public/appstore3.svg"
			class="w-[45vw] h-24 py-2 drop-shadow-lg"
		/>
		<img
			src="https://fearless.city/public/playstore.svg"
			class="w-[45vw] h-24 py-2 drop-shadow-lg"
		/>
	</div>
	<button class="p-0 px-0" onclick={(e) => install(e, 'appstorepreview')}>
		<div class="min-w-10 min-h-[500px] px-3 mt-3">
			<img src="/app/deletecringe.png" class="w-full drop-shadow-lg" />
		</div>
	</button>
	<div class="mt-[-9rem]" />

	<button class="p-0 px-0" onclick={(e) => install(e, 'final')}>
		<div
			class="mt-0 w-full rounded-3xl
	 bg-gradient-to-tr from-blue-200 to-blue-400
	 drop-shadow-md
	 border border-blue-900
	 button
	 !text-white
		"
		>
			<div class="p-2 relative rounded-3xl h-full">
				<div class="text-xl font-bold text-center drop-shadow-md">Tap here to go to app store</div>
				<div class="text-sm w-full flex justify-center items-center">
					<img
						src="https://fearless.city/public/appstore2.svg"
						class="w-[32rem] animate h-24 py-2 drop-shadow-lg"
					/>
				</div>
			</div>
		</div>
	</button>

	{#if test0}
		<div class="flex justify-center items-center mt-12">
			<div onclick={(e) => install(e, 'learnmore')}>
				<button role="button" class="button-30 scale-125"
					>Learn More <span class="drop-shadow-md ml-2">👾</span>
				</button>
				<div class="mt-3 text-center">⬆️ Tap to learn more</div>
			</div>
		</div>
	{/if}
	<button
		class="my-4 mt-8 text-center w-full"
		onclick={() => {
			u({
				tapTOS: true
			});
			window.open(
				'https://become-fearless.notion.site/Delete-Cringe-TOS-Privacy-policy-23c68fc296de8011b369e0e6952f10bc',
				'_blank'
			);
		}}
	>
		Privacy Policy & Terms of Service
	</button>
	<!-- {/if} -->
	<div class="my-64" />
	<!-- {#if test4}
		<div class="my-64" />
	{/if} -->

	<!-- <div class="my-64" /> -->
</div>

<div
	class="fixed bottom-0-safe w-full !bg-gradient-to-b !from-black/0 !to-black pt-64 pointer-events-none"
>
	<!-- <button class="p-1 px-1" onclick={install}> -->
	{#if test9 && false}
		<!-- <div
			onclick={(e) => install(e, 'installapp')}
			class="flex justify-center items-center pb-6 text-white flex-col pointer-events-auto"
		>
			<button role="button" class="button-30 {test1 ? 'animate' : ''}   scale-125 !text-black dark:!text-white mb-2">
				Continue

			</button>
			<div class="mt-3 text-center">⬆️ Tap to go to App Store</div>
		</div> -->
	{:else}
		<div class={test9 ? 'm-4' : ''}>
			<button
				class="p-0 px-0 {!test9 ? '!m-4' : ''} pointer-events-auto {test9 ? '!w-full' : ''} "
				onclick={(e) => install(e, 'appstoreshake')}
				style={test6 ? 'transform:scale(0.75);' : ''}
			>
				<!-- border-purpl+-600 -->
				<div
					class="
			
			{test3 ? 'h-[9rem]' : test4 ? 'h-[12rem]' : 'h-[11rem]'}
			{test9 ? '!h-[6rem] w-full' : ''}

			{test4 ? '!rounded-3xl' : ''}
			{test5 ? '!outline !outline-4 !outline-black' : ''}
			
			w-full
		 bg-gradient-to-tr from-blue-200 to-blue-400
		 drop-shadow-md
		 border border-blue-900
		 button
		 !text-white
			"
				>
					<div class="p-2 h-full flex justify-center items-center flex-col">
						<!-- <BorderBeam size={250} borderWidth={4} /> -->
						<!-- <BorderBeam size={250} borderWidth={1.5} duration={4} colorFrom="#ffffff" /> -->
						<div class="text-2xl font-bold text-center drop-shadow-md">
							<!-- ↘️ Tap to install Become Fearless -->
							<!-- Install Become Fearless -->

							<!-- Tap here to Become Fearless -->
							{#if test9}
								Continue
							{:else if test2}
								{#if test4}
									<span class="text-xl"> Tap here to go to App Store </span>
								{:else}
									Tap here to go to App Store
								{/if}
							{:else}
								Tap here to level up!
							{/if}
						</div>
						{#if !test9}
							<div class="text-sm w-full flex justify-center items-center">
								<img
									src="https://fearless.city/public/appstore2.svg"
									class="w-[32rem] {test1 ? 'animate' : ''} h-24 py-2 drop-shadow-lg"
								/>
							</div>
						{/if}
						<!-- <div>Install Become Fearless and join 4000+ players</div> -->
						<!-- <div class="text-xl font-bold text-center drop-shadow-md">Join 4000+ players</div> -->
						{#if test3}{:else if test2}
							<div class="text-xl font-bold text-center drop-shadow-md">
								& start leveling up in real life
							</div>
						{:else}
							<div class="text-xl font-bold text-center drop-shadow-md">Go to App Store</div>
						{/if}
					</div>
				</div>
			</button>
		</div>
	{/if}
</div>

<style>
	.button {
		display: inline-block;
		outline: 0;
		border: 0;
		cursor: pointer;
		will-change: box-shadow, transform;
		background: radial-gradient(100% 100% at 100% 0%, #89e5ff 0%, #5468ff 100%);
		box-shadow: 0px 2px 4px rgb(45 35 66 / 40%), 0px 7px 13px -3px rgb(45 35 66 / 30%),
			inset 0px -3px 0px rgb(58 65 111 / 50%);
		padding: 0 32px;
		border-radius: 6px;
		color: #fff;
		font-size: 18px;
		text-shadow: 0 1px 0 rgb(0 0 0 / 40%);
		transition: box-shadow 0.15s ease, transform 0.15s ease;
	}
	.animate {
		animation: shake 2.3s ease-in-out 0.3s;
		animation-iteration-count: infinite;
	}

	@keyframes shake {
		0% {
			transform: scale(1) rotate(0deg);
		}

		25% {
			transform: scale(1.02) rotate(1deg);
		}
		50% {
			transform: scale(1) rotate(-1deg);
		}
		75% {
			transform: scale(1.02) rotate(1deg);
		}
		100% {
			transform: scale(1) rotate(0deg);
		}
	}

	.button2 {
		align-items: center;
		appearance: none;
		background-color: #fcfcfd;
		border-radius: 4px;
		border-width: 0;
		box-shadow: rgba(45, 35, 66, 0.2) 0 2px 4px, rgba(45, 35, 66, 0.15) 0 7px 13px -3px,
			#d6d6e7 0 -3px 0 inset;
		box-sizing: border-box;
		color: #36395a;
		cursor: pointer;
		display: inline-flex;
		font-family: 'JetBrains Mono', monospace;
		height: 48px;
		justify-content: center;
		line-height: 1;
		list-style: none;
		overflow: hidden;
		padding-left: 16px;
		padding-right: 16px;
		position: relative;
		text-align: left;
		text-decoration: none;
		transition: box-shadow 0.15s, transform 0.15s;
		user-select: none;
		-webkit-user-select: none;
		touch-action: manipulation;
		white-space: nowrap;
		will-change: box-shadow, transform;
		font-size: 18px;
	}

	/* CSS */
	.button-30 {
		align-items: center;
		appearance: none;
		background-color: #fcfcfd;
		border-radius: 4px;
		border-width: 0;
		box-shadow: rgba(45, 35, 66, 0.4) 0 2px 4px, rgba(45, 35, 66, 0.3) 0 7px 13px -3px,
			#d6d6e7 0 -3px 0 inset;
		box-sizing: border-box;
		color: #36395a;
		cursor: pointer;
		display: inline-flex;
		font-family: 'JetBrains Mono', monospace;
		height: 48px;
		justify-content: center;
		line-height: 1;
		list-style: none;
		overflow: hidden;
		padding-left: 16px;
		padding-right: 16px;
		position: relative;
		text-align: left;
		text-decoration: none;
		transition: box-shadow 0.15s, transform 0.15s;
		user-select: none;
		-webkit-user-select: none;
		touch-action: manipulation;
		white-space: nowrap;
		will-change: box-shadow, transform;
		font-size: 18px;
	}

	.poppins-thin {
		font-family: 'Poppins', sans-serif;
		font-weight: 100;
		font-style: normal;
	}

	.poppins-extralight {
		font-family: 'Poppins', sans-serif;
		font-weight: 200;
		font-style: normal;
	}

	.poppins-light {
		font-family: 'Poppins', sans-serif;
		font-weight: 300;
		font-style: normal;
	}

	.poppins-regular {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-style: normal;
	}

	.poppins-medium {
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
		font-style: normal;
	}

	.poppins-semibold {
		font-family: 'Poppins', sans-serif;
		font-weight: 600;
		font-style: normal;
	}

	.poppins-bold {
		font-family: 'Poppins', sans-serif;
		font-weight: 700;
		font-style: normal;
	}

	.poppins-extrabold {
		font-family: 'Poppins', sans-serif;
		font-weight: 800;
		font-style: normal;
	}

	.poppins-black {
		font-family: 'Poppins', sans-serif;
		font-weight: 900;
		font-style: normal;
	}

	.poppins-thin-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 100;
		font-style: italic;
	}

	.poppins-extralight-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 200;
		font-style: italic;
	}

	.poppins-light-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 300;
		font-style: italic;
	}

	.poppins-regular-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 400;
		font-style: italic;
	}

	.poppins-medium-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 500;
		font-style: italic;
	}

	.poppins-semibold-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 600;
		font-style: italic;
	}

	.poppins-bold-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 700;
		font-style: italic;
	}

	.poppins-extrabold-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 800;
		font-style: italic;
	}

	.poppins-black-italic {
		font-family: 'Poppins', sans-serif;
		font-weight: 900;
		font-style: italic;
	}
</style>
