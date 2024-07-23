<script lang="ts">
	import countries from '$lib/countries'

	export let selectCountry: (code: string) => void
	export let toggleVisitedCountry: (code: string) => void
	export let visitedCountries: string[]
	export let selectedCountryCode: string | undefined

	let searchText = ''

	$: filteredCountries = countries.features
		.filter(
			(feature) =>
				feature.properties.NAME_RU.toLowerCase().includes(searchText.toLowerCase()) ||
				feature.properties.NAME_EN.toLowerCase().includes(searchText.toLowerCase()) ||
				selectedCountryCode === feature.properties.ADM0_A3
		)
		.map((feature) => feature.properties)
		// show selected first, then visited, then sort by name
		.sort((a, b) => {
			if (a.ADM0_A3 === selectedCountryCode) return -1
			if (b.ADM0_A3 === selectedCountryCode) return 1
			if (visitedCountries.includes(a.ADM0_A3) && !visitedCountries.includes(b.ADM0_A3))
				return -1
			if (visitedCountries.includes(b.ADM0_A3) && !visitedCountries.includes(a.ADM0_A3))
				return 1
			return a.NAME_RU.localeCompare(b.NAME_RU)
		})
</script>

<div class="popup">
	<input type="text" bind:value={searchText} placeholder="Search..." />

	<ul>
		{#each filteredCountries as country}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<li
				on:click={() => selectCountry(country.ADM0_A3)}
				class:selected={country.ADM0_A3 === selectedCountryCode}
			>
				{country.NAME_RU}
				<button
					on:click={() => toggleVisitedCountry(country.ADM0_A3)}
					class="visit"
					class:visited={visitedCountries.includes(country.ADM0_A3)}
				>
					{#if visitedCountries.includes(country.ADM0_A3)}
						✓
					{:else}
						+
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	ul {
		overflow-y: auto;
		height: 25vh;
		overflow-y: auto;
	}

	li {
		padding: 0.5em;
		cursor: pointer;
	}

	li.selected {
		background: #f9f9f9;
	}

	p {
		margin: 0;
		text-align: center;
	}

	input {
		width: 100%;
		margin: 0.5em auto;
		padding: 0.5em;
		border: none;
		border-bottom: 1px solid #ccc;
	}

	.visit {
		background: #faefeb;
		color: #666;
		border: none;
		border-radius: 5px;
		padding: 5px 10px;
		cursor: pointer;
	}

	.visit.visited {
		background: #ffa726;
		color: white;
	}

	.popup {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		padding: 10px;
		border-radius: 25px 25px 0 0;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}
</style>
