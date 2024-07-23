<script lang="ts">
	import type { CountryProperties } from '$lib/countries'
	import type { StyleSpecification } from 'maplibre-gl'
	import maplibregl from 'maplibre-gl'
	import 'maplibre-gl/dist/maplibre-gl.css'
	import { onDestroy, onMount } from 'svelte'
	import type { Feature, Polygon } from 'geojson'
	import bbox from '@turf/bbox'
	import { base } from '$app/paths'

	export let selectedCountry: Feature<Polygon, CountryProperties> | undefined
	export let visitedCountryCodes: string[]
	export let onMapClicked: (countryCode?: string) => void

	let map: maplibregl.Map

	onMount(() => {
		const mapBackground = '#1e3d59'
		const countryBackground = '#f5f0e1'
		const countryNameText = '#1e3d59'
		const visitedCountryBackground = '#ff6e40'
		const selectedCountryBackground = '#ffc13b'
		const visitedSelectedCountryBackground = '#ff9e20'

		const baseUrl = window.location.origin + base

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
			glyphs: 'http://fonts.openmaptiles.org/{fontstack}/{range}.pbf', // TODO add to repo
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
				tiles: [`${baseUrl}/tiles/countries/{z}/{x}/{y}.pbf`],
				maxzoom: 2,
				promoteId: 'ADM0_A3',
			})
			map.addLayer({
				id: 'countries-fill',
				type: 'fill',
				source: 'countries',
				'source-layer': 'countries',
				paint: {
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
				tiles: [`${baseUrl}/tiles/countries-line/{z}/{x}/{y}.pbf`],
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
				tiles: [`${baseUrl}/tiles/countries-label/{z}/{x}/{y}.pbf`],
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
				onMapClicked()
				return
			}
			const feature = features[0]
			const countryCode = feature.properties.ADM0_A3
			onMapClicked(countryCode)
		})

		map.on('sourcedata', (e) => {
			if (e.sourceId === 'countries' && e.isSourceLoaded) {
				updateVisitedCountries(visitedCountryCodes)
			}
		})
	})

	onDestroy(() => {
		map?.remove()
	})

	$: {
		if (map) {
			const updateSelected = () => {
				map.querySourceFeatures('countries', {
					sourceLayer: 'countries',
				}).forEach((feature) => {
					map.setFeatureState(
						{ source: 'countries', sourceLayer: 'countries', id: feature.id },
						{
							selected:
								feature.properties.ADM0_A3 === selectedCountry?.properties?.ADM0_A3,
						}
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
					maxDuration: 2500,
				})

				map.once('idle', () => {
					updateSelected()
				})
			}
		}
	}

	$: {
		if (map) {
			updateVisitedCountries(visitedCountryCodes)
			map.once('idle', () => {
				updateVisitedCountries(visitedCountryCodes)
			})
		}
	}

	function updateVisitedCountries(codes: string[]) {
		map.querySourceFeatures('countries', {
			sourceLayer: 'countries',
		}).forEach((feature) => {
			map.setFeatureState(
				{ source: 'countries', sourceLayer: 'countries', id: feature.id },
				{ visited: codes.includes(feature.properties.ADM0_A3) }
			)
		})
	}
</script>

<div id="map" />

<style>
	#map {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
</style>
