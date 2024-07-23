<script lang="ts">
	import countries from '$lib/countries'
	import maplibregl, { type StyleSpecification } from 'maplibre-gl'
	import 'maplibre-gl/dist/maplibre-gl.css'
	import { onDestroy, onMount } from 'svelte'
	import { writable } from 'svelte/store'
	import CountrySelector from '../components/CountrySelector.svelte'
	import bbox from '@turf/bbox'

	let map: maplibregl.Map

	let selectedCountryCode: string | undefined

	const visitedCountries = writable<string[]>([])

	let popupOpen = false

	$: selectedCountry = selectedCountryCode
		? countries.features.find((feature) => feature.properties.ADM0_A3 === selectedCountryCode)
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
			attributionControl: false,
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
					'text-halo-color': '#ddd',
					'text-halo-width': 1,
				},
				minzoom: 3,
			})
		})

		map.on('mouseenter', 'countries-fill', () => {
			map.getCanvas().style.cursor = 'pointer'
		})

		map.on('mouseleave', 'countries-fill', () => {
			map.getCanvas().style.cursor = ''
		})

		map.on('click', (e) => {
			const features = map.queryRenderedFeatures(e.point)
			if (!features.length) {
				selectedCountryCode = undefined
				popupOpen = false
				return
			}
			const feature = features[0]
			selectedCountryCode = feature.properties.ADM0_A3
			popupOpen = true
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
		if (map) {
			console.log('Selected country:', selectedCountry?.properties?.NAME_RU)
			const updateSelected = () => {
				map.querySourceFeatures('countries', {
					sourceLayer: 'countries',
				}).forEach((feature) => {
					map.setFeatureState(
						{ source: 'countries', sourceLayer: 'countries', id: feature.id },
						{ selected: feature.properties.ADM0_A3 === selectedCountryCode }
					)
				})
			}

			updateSelected()

			if (selectedCountry) {
				const boundingBox = bbox(selectedCountry as any)

				map.fitBounds(boundingBox as any, {
					padding: {
						top: 25,
						left: 45,
						right: 45,
						bottom: 345,
					},
					maxDuration: 1000,
				})

				map.once('idle', () => {
					updateSelected()
				})
			}
		}
	}

	$: {
		console.log('Visited countries:', $visitedCountries)
		if (map && map.loaded()) {
			updateVisitedCountries()
		}
	}

	function updateVisitedCountries() {
		map.querySourceFeatures('countries', {
			sourceLayer: 'countries',
		}).forEach((feature) => {
			map.setFeatureState(
				{ source: 'countries', sourceLayer: 'countries', id: feature.id },
				{ visited: $visitedCountries.includes(feature.properties.ADM0_A3) }
			)
		})
	}

	function toggleVisitedCountry(code: string) {
		visitedCountries.update((countries) => {
			if (!code) {
				return countries
			}
			if (countries.includes(code)) {
				return countries.filter((country) => country !== code)
			} else {
				return [...countries, code]
			}
		})
	}
</script>

<div class="stats">
	<p>{$visitedCountries.length} / {countries.features.length}</p>
</div>

<div id="map" />

{#if popupOpen}
	<CountrySelector
		visitedCountries={$visitedCountries}
		{selectedCountryCode}
		selectCountry={(code) => {
			selectedCountryCode = code
		}}
		{toggleVisitedCountry}
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
	#map {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}

	.stats {
		position: absolute;
		top: 0;
		left: 0;
		padding: 10px;
		width: 100%;
		text-align: center;
		font-size: larger;
		z-index: 1;
	}

	.add {
		position: absolute;
		bottom: 0;
		right: 0;
		padding: 10px;
		aspect-ratio: 1;
		width: 40px;
		height: 40px;
		line-height: 0;
		font-size: x-large;
		border-radius: 50%;
		margin: 10px;
		background-color: #ff5722;
		color: white;
		cursor: pointer;
	}
</style>
