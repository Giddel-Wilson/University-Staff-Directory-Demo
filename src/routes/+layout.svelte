<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	
	let { children } = $props();

	// Load Google Fonts
	onMount(() => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@300;400;500;600&family=Roboto+Mono:wght@400;500&display=swap';
		document.head.appendChild(link);
	});
</script>

<svelte:head>
	<title>University Staff Directory</title>
	<meta name="description" content="University Staff Directory - Search and connect with university faculty and staff members" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>

{@render children()}
