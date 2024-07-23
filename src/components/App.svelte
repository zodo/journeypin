<script lang="ts">
	import countries from '$lib/countries'
	import CountrySelector from '../components/CountrySelector.svelte'
	import Map from '../components/Map.svelte'
	import { onMount, tick } from 'svelte'
	import createCloudStore from '$lib/telegram-storage'
	import type { StorageSchema } from '$lib/models'
	import { initHapticFeedback, initMainButton, initMiniApp, postEvent } from '@telegram-apps/sdk'

	const [miniApp] = initMiniApp()
	const [mainButton] = initMainButton()
	const hapticFeedback = initHapticFeedback()

	onMount(() => {
		miniApp.setBgColor('#1e3d59')
		miniApp.setHeaderColor('#1e3d59')
		postEvent('web_app_expand')

		mainButton.setParams({
			text: 'Countries',
			bgColor: '#ff6e40',
			textColor: '#1e3d59',
		})
		const clickListener = () => {
			hapticFeedback.impactOccurred('light')
			selectedCountryCode = undefined
			popupOpen = !popupOpen
		}
		mainButton.enable()
		mainButton.on('click', clickListener)
		mainButton.show()

		miniApp.ready()

		return () => {
			mainButton.off('click', clickListener)
		}
	})

	const storage = createCloudStore<StorageSchema>({
		countries: [],
	})

	let scrollToCountry: (code: string) => void
	let selectedCountryCode: string | undefined
	let popupOpen = false

	$: selectedCountry = selectedCountryCode
		? countries.features.find((feature) => feature.properties.ADM0_A3 === selectedCountryCode)
		: undefined

	$: selectedCountryCode, hapticFeedback.selectionChanged()

	const toggleVisitedCountry = (code: string) => {
		setTimeout(() => {
			hapticFeedback.impactOccurred('medium')
		}, 100)
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

<div class="wrap">
	<div class="content">
		<div class="stats">
			<p>{$storage.countries.length} / {countries.features.length}</p>
		</div>

		<Map
			visitedCountryCodes={$storage.countries}
			{selectedCountry}
			onMapClicked={handleMapClicked}
		/>

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
		{/if}
	</div>
</div>

<style>
	.wrap {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.content {
		height: calc(100% + 1px);
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
		color: #f5f0e1;
		text-shadow: 0 0 5px #1e3d59;
	}
</style>
