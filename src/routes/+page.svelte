<script lang="ts">
	import countries from '$lib/countries'
	import maplibregl, { type StyleSpecification } from 'maplibre-gl'
	import 'maplibre-gl/dist/maplibre-gl.css'
	import { onDestroy, onMount } from 'svelte'
	import { writable } from 'svelte/store'

	let map: maplibregl.Map

	let selectedCountryCode: string | undefined

	const visitedCountries = writable<string[]>(['RUS', 'ESP'])

	$: selectedCountryName = selectedCountryCode
		? countries[selectedCountryCode].NAME_RU
		: undefined

	onMount(() => {
		const mapBackground = '#e0e0e0' // light grey for a subtle map background
		const countryBackground = '#f8f4e3' // very light beige for a soft country background
		const countryNameText = '#2e2e2e' // dark slate grey for readable country names

		const visitedCountryBackground = '#ffa726' // bright orange for a highly visible visited country background
		const selectedCountryBackground = '#ff7043' // vibrant orange-red for a clearly visible selected country background
		const visitedSelectedCountryBackground = '#ff5722' // dark orange-red for a very visible visited and selected country background

		const emptyBasemap: StyleSpecification = {
			version: 8,
			sources: {},
			layers: [
				{
					id: 'background',
					type: 'background',
					paint: {
						'background-color': mapBackground,
					},
				},
			],
			glyphs: 'http://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
		}
		map = new maplibregl.Map({
			container: 'map', // container id
			style: emptyBasemap,
			center: [2.35, 48.85],
			zoom: 1, // starting zoom
			maxZoom: 5,
		})

		map.on('load', () => {
			map.addSource('countries', {
				type: 'vector',
				tiles: ['http://localhost:5173/tiles/countries/{z}/{x}/{y}.pbf'],
				// tiles: ['https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf'],
				maxzoom: 2,
				promoteId: 'ADM0_A3',
			})
			map.addLayer({
				id: 'countries-fill',
				type: 'fill',
				source: 'countries',
				'source-layer': 'countries',
				paint: {
					// fill depending on states visited and selected. Use feature-state
					'fill-color': [
						'case',
						[
							'all',
							['boolean', ['feature-state', 'visited'], false],
							['boolean', ['feature-state', 'selected'], false],
						],
						visitedSelectedCountryBackground,
						['boolean', ['feature-state', 'selected'], false],
						selectedCountryBackground,
						['boolean', ['feature-state', 'visited'], false],
						visitedCountryBackground,
						countryBackground,
					],
				},
			})

			map.addSource('countries-line', {
				type: 'vector',
				tiles: ['http://localhost:5173/tiles/countries-line/{z}/{x}/{y}.pbf'],
				maxzoom: 2,
			})
			map.addLayer({
				id: 'countries-line',
				type: 'line',
				source: 'countries-line',
				'source-layer': 'boundaries',
				paint: {
					'line-color': mapBackground,
					'line-width': 1,
				},
			})

			map.addSource('countries-label', {
				type: 'vector',
				tiles: ['http://localhost:5173/tiles/countries-label/{z}/{x}/{y}.pbf'],
				maxzoom: 2,
			})
			map.addLayer({
				id: 'countries-label',
				type: 'symbol',
				source: 'countries-label',
				'source-layer': 'countrieslabelsonsurface',
				layout: {
					'text-field': ['get', 'NAME_RU'],
					'text-font': ['Klokantech Noto Sans Regular'],
					'text-justify': 'auto',
					'text-size': 12,
				},
				paint: {
					'text-color': countryNameText,
					'text-halo-color': '#ffffff',
					'text-halo-width': 1,
				},
				minzoom: 3,
			})
		})

		map.on('click', (e) => {
			const features = map.queryRenderedFeatures(e.point)
			if (!features.length) {
				selectedCountryCode = undefined
				return
			}
			const feature = features[0]
			console.log('Feature:', feature)

			selectedCountryCode = feature.properties.ADM0_A3
		})

		map.on('sourcedata', (e) => {
			if (e.sourceId === 'countries' && e.isSourceLoaded) {
				updateVisitedCountries()
			}
		})
	})

	onDestroy(() => {
		map?.remove()
	})

	$: {
		console.log('Selected country:', selectedCountryCode)
		if (map && map.loaded()) {
			map.querySourceFeatures('countries', {
				sourceLayer: 'countries',
			}).forEach((feature) => {
				map.setFeatureState(
					{ source: 'countries', sourceLayer: 'countries', id: feature.id },
					{ selected: feature.properties.ADM0_A3 === selectedCountryCode }
				)
			})
		}
	}

	$: {
		console.log('Visited countries:', $visitedCountries)
		if (map && map.loaded()) {
			updateVisitedCountries()
		}
	}

	function updateVisitedCountries() {
		console.log('Updating visited countries', $visitedCountries)
		map.querySourceFeatures('countries', {
			sourceLayer: 'countries',
		}).forEach((feature) => {
			map.setFeatureState(
				{ source: 'countries', sourceLayer: 'countries', id: feature.id },
				{ visited: $visitedCountries.includes(feature.properties.ADM0_A3) }
			)
		})
	}

	function toggleVisitedCountry() {
		visitedCountries.update((countries) => {
			if (!selectedCountryCode) {
				return countries
			}
			if (countries.includes(selectedCountryCode)) {
				return countries.filter((country) => country !== selectedCountryCode)
			} else {
				return [...countries, selectedCountryCode]
			}
		})
	}
</script>

<div id="map" />
{#if selectedCountryCode}
	<div class="selected">
		<p>
			{selectedCountryName}
			<button
				on:click={toggleVisitedCountry}
				class:visited={$visitedCountries.includes(selectedCountryCode)}
			>
				Посетил
			</button>
		</p>
	</div>
{/if}

<style>
	#map {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}

	.selected {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: white;
		padding: 10px;
		border-radius: 25px 25px 0 0;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.selected button {
		background: #faefeb;
		color: black;
		border: none;
		border-radius: 5px;
		padding: 5px 10px;
		cursor: pointer;
	}

	.selected button.visited {
		background: #ffa726;
		color: white;
	}
</style>
