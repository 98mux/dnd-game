<script>
	import InstallApp from '$lib/ad/InstallApp.svelte';
</script>

<InstallApp
	onclick={(fbc) => {
		fetch('/ad', {
			method: 'POST',
			body: JSON.stringify({ fbc })
		});
	}}
/>
