<script lang="ts">
	import countries from '$lib/countries'
	import CountrySelector from '../components/CountrySelector.svelte'
	import Map from '../components/Map.svelte'
	import { tick } from 'svelte'
	import createCloudStore from '$lib/telegram-storage'
	import type { StorageSchema } from '$lib/models'

	const storage = createCloudStore<StorageSchema>({
		countries: [],
	})

	let scrollToCountry: (code: string) => void
	let selectedCountryCode: string | undefined
	let popupOpen = false

	$: selectedCountry = selectedCountryCode
		? countries.features.find((feature) => feature.properties.ADM0_A3 === selectedCountryCode)
		: undefined

	const toggleVisitedCountry = (code: string) => {
		storage.update((storage) => {
			if (!code) {
				return storage
			}
			if (storage.countries.includes(code)) {
				selectedCountryCode = undefined
				return {
					...storage,
					countries: storage.countries.filter((country) => country !== code),
				}
			} else {
				selectedCountryCode = code
				return {
					...storage,
					countries: [...storage.countries, code],
				}
			}
		})
	}

	const handleMapClicked = (code?: string) => {
		selectedCountryCode = code
		if (code) {
			popupOpen = true
			tick().then(() => scrollToCountry(code))
		} else {
			popupOpen = false
		}
	}
</script>

<div class="stats">
	<p>{$storage.countries.length} / {countries.features.length}</p>
</div>

<Map visitedCountryCodes={$storage.countries} {selectedCountry} onMapClicked={handleMapClicked} />

{#if popupOpen}
	<CountrySelector
		visitedCountries={$storage.countries}
		{selectedCountryCode}
		selectCountry={(code) => {
			selectedCountryCode = code
		}}
		{toggleVisitedCountry}
		bind:scrollIntoView={scrollToCountry}
		closeClicked={() => {
			selectedCountryCode = undefined
			popupOpen = false
		}}
	/>
{:else}
	<button
		class="add"
		on:click={() => {
			selectedCountry = undefined
			popupOpen = true
		}}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
		</svg>
	</button>
{/if}

<style>
	.stats {
		position: absolute;
		top: 0;
		left: 0;
		padding: 10px;
		width: 100%;
		text-align: center;
		font-size: larger;
		z-index: 1;
		color: #f5f0e1;
		text-shadow: 0 0 5px #1e3d59;
	}

	.add {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 10px;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		margin: 10px;
		background-color: #ff6e40;
		color: #1e3d59;
		cursor: pointer;
		outline: none;
		border: none;
	}
</style>
