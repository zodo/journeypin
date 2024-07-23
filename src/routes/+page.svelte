<script lang="ts">
	import { retrieveLaunchParams } from '@telegram-apps/sdk'
	import App from '../components/App.svelte'

	let outsideOfTg = false
	try {
		retrieveLaunchParams()
	} catch (e) {
		console.error(e)
		outsideOfTg = true
	}
</script>

{#if outsideOfTg}
	<div class="outside-of-tg">
		<p>Open this mini-app in Telegram to see the map</p>
		<a href="https://t.me/journeypin_bot/map">Open</a>
	</div>
{:else}
	<App />
{/if}

<style>
	.outside-of-tg {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		flex-direction: column;
		gap: 1em;
	}
</style>
