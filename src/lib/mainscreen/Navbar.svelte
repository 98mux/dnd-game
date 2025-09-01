<script lang="ts">
	import { goto } from '$app/navigation';
	import { userState } from '$lib/state/userState.svelte';
	import { toggleTheme } from '$lib/state/theme';

	let menuOpen = $state(false);

	function navigate(path: string) {
		menuOpen = false;
		goto(path);
	}
</script>

<nav
	class="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/90 dark:supports-[backdrop-filter]:bg-black/40 dark:bg-black/60 border-b border-black/5 dark:border-white/10"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-14 items-center justify-between">
			<!-- Brand -->
			<div class="flex items-center gap-3">
				<div class="relative">
					<div
						class="h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-400 via-amber-500 to-rose-500 shadow ring-1 ring-black/10 dark:ring-white/10"
					>
						<!-- <span class="sr-only">Home</span> -->
						<div class="i-lucide-rocket text-xl z-50 relative">🎮</div>
					</div>
					<div
						class="pointer-events-none absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
						style="background: radial-gradient(100px 60px at 10px 10px, rgba(255,255,255,0.35), transparent 60%), radial-gradient(120px 80px at 80% 10px, rgba(255,255,255,0.2), transparent 60%);"
					>
						<span class="i-lucide-rocket text-2xl z-50 relative">▶️</span>
					</div>
				</div>
				<button
					class="text-lg font-semibold tracking-tight hover:opacity-80 transition"
					onclick={() => navigate('/')}
				>
					Play Cursor
				</button>
			</div>

			<!-- Desktop nav -->
			<div class="hidden md:flex items-center gap-1">
				<button
					class="px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
					onclick={() => navigate('/')}
				>
					Home
				</button>
				<!-- Kanban link removed -->
				<button
					class="px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
					onclick={() => navigate('/settings')}
				>
					Settings
				</button>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-2">
				<!-- Theme toggle -->
				<button
					class="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
					onclick={toggleTheme}
					aria-label="Toggle theme"
				>
					<span class="i-sun block dark:hidden">☀️</span>
					<span class="i-moon hidden dark:block">🌙</span>
				</button>

				{#if userState.isLoggedIn}
					<button
						class="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
						onclick={() => {
							userState.logout();
							navigate('/login');
						}}
					>
						Logout
					</button>
				{:else}
					<button
						class="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
						onclick={() => navigate('/login')}
					>
						Login
					</button>
					<button
						class="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow hover:opacity-90 transition text-sm font-semibold"
						onclick={() => navigate('/signup')}
					>
						Sign up
					</button>
				{/if}

				<!-- Mobile menu button -->
				<button
					class="md:hidden ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
					onclick={() => (menuOpen = !menuOpen)}
					aria-label="Toggle menu"
				>
					{#if menuOpen}
						<span>✖</span>
					{:else}
						<span>☰</span>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Mobile menu -->
	<div
		class={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ${
			menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
		}`}
	>
		<div
			class="px-4 pt-2 pb-4 space-y-1 bg-white/80 dark:bg-black/50 backdrop-blur border-t border-black/5 dark:border-white/10"
		>
			<button
				class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
				onclick={() => navigate('/')}
			>
				Home
			</button>
			<!-- Kanban link removed -->
			<button
				class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
				onclick={() => navigate('/settings')}
			>
				Settings
			</button>
			<div class="h-px bg-black/5 dark:bg-white/10 my-2" />
			<button
				class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
				onclick={toggleTheme}
			>
				Toggle theme
			</button>
			{#if userState.isLoggedIn}
				<button
					class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
					onclick={() => {
						userState.logout();
						navigate('/login');
					}}
				>
					Logout
				</button>
			{:else}
				<button
					class="block w-full text-left px-3 py-2 rounded-md text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition"
					onclick={() => navigate('/login')}
				>
					Login
				</button>
				<button
					class="block w-full text-left px-3 py-2 rounded-md text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-90 transition"
					onclick={() => navigate('/signup')}
				>
					Sign up
				</button>
			{/if}
		</div>
	</div>
</nav>

<style>
	/* fun animated top border beam */
	nav::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			rgba(255, 107, 34, 0) 0%,
			rgba(255, 107, 34, 1) 20%,
			rgba(248, 82, 0, 1) 50%,
			rgba(255, 107, 34, 1) 80%,
			rgba(255, 107, 34, 0) 100%
		);
		mask: linear-gradient(90deg, transparent, black 20%, black 80%, transparent);
		animation: beam 4s linear infinite;
		opacity: 0.8;
	}
	@keyframes beam {
		0% {
			background-position: 0% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
</style>
