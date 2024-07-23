<script lang="ts">
	import countries from '$lib/countries'
	import { tick } from 'svelte'
	import CountryListElement from './CountryListElement.svelte'
	import { slide } from 'svelte/transition'
	import { i18n, i18nNameExtractor } from '$lib/i18n'

	export let selectCountry: (code: string) => void
	export let toggleVisitedCountry: (code: string) => void
	export let visitedCountries: string[]
	export let selectedCountryCode: string | undefined
	export let closeClicked: () => void

	export const scrollIntoView = (code: string) => {
		tick().then(() => {
			const el = document.getElementsByClassName(`country-${code}`)
			if (el.length > 0) {
				el[0].scrollIntoView({ block: 'center', behavior: 'smooth' })
			}
		})
	}

	let searchText = ''

	$: filteredCountries = countries.features
		.filter(
			(feature) =>
				$i18nNameExtractor(feature.properties)
					.toLowerCase()
					.includes(searchText.toLowerCase()) ||
				feature.properties.NAME_EN.toLowerCase().includes(searchText.toLowerCase()) ||
				selectedCountryCode === feature.properties.ADM0_A3
		)
		.map((feature) => feature.properties)
		.sort((a, b) => $i18nNameExtractor(a).localeCompare($i18nNameExtractor(b)))
</script>

<div class="popup" out:slide={{ duration: 250 }}>
	<div class="header">
		<input type="text" bind:value={searchText} placeholder={$i18n.search} />
		<button class="close" on:click={closeClicked}>
			<svg
				class="w-6 h-6 text-gray-800 dark:text-white"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				fill="none"
				viewBox="0 0 24 24"
			>
				<path
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18 17.94 6M18 18 6.06 6"
				/>
			</svg>
		</button>
	</div>

	<div class="scrollable">
		<h3>{$i18n.visited}</h3>

		{#if visitedCountries.length > 0}
			<ul>
				{#each filteredCountries.filter( (country) => visitedCountries.includes(country.ADM0_A3) ) as country}
					<CountryListElement
						{country}
						selectClicked={() => selectCountry(country.ADM0_A3)}
						visitClicked={() => toggleVisitedCountry(country.ADM0_A3)}
						selected={selectedCountryCode === country.ADM0_A3}
						visited={true}
					/>
				{/each}
			</ul>
		{:else}
			<p>{$i18n.noVisited}</p>
		{/if}

		<h3>{$i18n.all}</h3>
		<ul>
			{#each filteredCountries as country}
				<CountryListElement
					{country}
					selectClicked={() => selectCountry(country.ADM0_A3)}
					visitClicked={() => toggleVisitedCountry(country.ADM0_A3)}
					selected={selectedCountryCode === country.ADM0_A3}
					visited={visitedCountries.includes(country.ADM0_A3)}
				/>
			{/each}
		</ul>
	</div>
</div>

<style>
	.scrollable {
		overflow-y: auto;
		height: 40vh;
	}

	h3 {
		margin: 0.5em 0;
	}

	p {
		color: #666;
		margin-left: 0.8em;
		display: block;
	}

	input {
		width: 100%;
		margin: 0.5em auto;
		padding: 0.5em;
		border: none;
		border-bottom: 1px solid #ccc;
		font-size: 1em;
	}

	.popup {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		padding: 10px;
		border-radius: 20px 20px 0 0;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1em;
	}

	.close {
		background: none;
		border: none;
		cursor: pointer;
		margin-right: 0.5em;
	}
</style>
