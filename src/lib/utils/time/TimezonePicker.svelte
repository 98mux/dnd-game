<script lang="ts">
	import timezones from 'timezones.json';

	let { value, onUpdate } = $props();

	const findUTC = (value: string) => {
		const timezone = timezones.find((t) => t.utc.includes(value));
		return timezone?.text ?? '';
	};

	let selectedTimezone = $state(findUTC(value)); // Selected timezone value

	const handleSelect = (event: Event) => {
		const target = event.target as HTMLSelectElement;
		selectedTimezone = target.value;

		const timezoneWithText = timezones.find((t) => t.text === selectedTimezone);
		if (timezoneWithText) {
			onUpdate(timezoneWithText.utc[0]);
		}

		// Trigger update if necessary
		// onUpdate(findUTC(selectedTimezone));
		console.log('Selected Timezone:', selectedTimezone);
	};
</script>

<div class="timezone-picker !mx-2 !text-base">
	<select bind:value={selectedTimezone} on:change={handleSelect}>
		<option value="" disabled>Select your timezone</option>
		{#each timezones as timezone}
			<option class="!text-xs" value={timezone.text}>Timezone - {timezone.text}</option>
		{/each}
	</select>

	<!-- {#if selectedTimezone}
		<p>Selected Timezone: {selectedTimezone}</p>
	{/if} -->
</div>

<style>
	.timezone-picker {
		max-width: 100%;
		margin: 0 auto;
		display: flex;
		flex-direction: column;

		padding: 0.5rem;
		gap: 0.5rem;
	}

	select {
		border: 1px solid #ccc;
		border-radius: 6px;
		background-color: #fff;
		appearance: none;
		color: #111827;
		padding: 0.8rem;
		outline: none;
		transition: box-shadow 0.15s ease, border-color 0.15s ease;
	}

	/* Dark mode select styles */
	html.dark .timezone-picker select {
		background-color: #111827;
		color: #ffffff;
		border-color: #374151;
	}

	select:focus {
		border-color: rgba(255, 107, 34, 0.6);
		box-shadow: 0 0 0 3px rgba(255, 107, 34, 0.35);
	}

	html.dark .timezone-picker select:focus {
		border-color: rgba(255, 107, 34, 0.7);
		box-shadow: 0 0 0 3px rgba(255, 107, 34, 0.45);
	}
</style>
