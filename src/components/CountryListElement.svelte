<script lang="ts">
	import type { CountryProperties } from '$lib/countries'

	export let country: CountryProperties
	export let selectClicked: () => void
	export let visitClicked: () => void
	export let selected: boolean
	export let visited: boolean
</script>

<li class={`country-${country.ADM0_A3}`} class:selected>
	<button on:click|stopPropagation={visitClicked} class="visit" class:visited>
		{#if visited}
			<svg
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
					d="M5 11.917 9.724 16.5 19 7.5"
				/>
			</svg>
		{:else}
			<svg
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
					d="M5 12h14m-7 7V5"
				/>
			</svg>
		{/if}
	</button>

	<button on:click={selectClicked} class="country">
		{country.NAME_RU}
	</button>
</li>

<style>
	li {
		padding: 0.5em;
		display: flex;
		align-items: center;
	}

	li.selected {
		background: #f9f9f9;
	}

	.visit {
		background: #f5f0e1;
		color: #1e3d59;
		border: none;
		border-radius: 0.5em;
		padding: 0.1em 0.5em;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		line-height: 1;
	}

	.visit.visited {
		background: #ff6e40;
		color: white;
	}

	svg {
		width: 1em;
		height: 1em;
		display: block;
	}

	.country {
		margin-left: 0.5em;
		background: none;
		border: none;
		cursor: pointer;
		width: 100%;
		text-align: left;
		font-size: 0.9rem;
	}
</style>
