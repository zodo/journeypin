<script lang="ts">
	import maplibregl, { type StyleSpecification } from 'maplibre-gl'
	import 'maplibre-gl/dist/maplibre-gl.css'
	import { onMount } from 'svelte'

	let map: maplibregl.Map

	let zoomLevel = 1

	onMount(() => {
		const mapBackground = '#e0e0e0' // light grey for a subtle map background
		const countryBackground = '#f8f4e3' // very light beige for a soft country background
		const countryOutline = '#4a4a4a' // dark grey for clear country outlines
		const countryNameText = '#2e2e2e' // dark slate grey for readable country names

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
			})
			map.addLayer({
				id: 'countries-fill',
				type: 'fill',
				source: 'countries',
				'source-layer': 'countries',
				paint: {
					'fill-color': countryBackground,
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
					'line-color': countryOutline,
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

		map.on('zoom', () => {
			zoomLevel = map.getZoom()
		})
	})
</script>

<h1>Working with map</h1>

<p>Zoom level: {zoomLevel}</p>

<div id="map" style="height: 400px;"></div>
