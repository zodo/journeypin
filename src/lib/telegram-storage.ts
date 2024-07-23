import { initCloudStorage } from '@telegram-apps/sdk'
import { writable } from 'svelte/store'

const CHUNK_SIZE = 4000
const KEY_PREFIX = 'store_'
const META_KEY = 'store_meta'

type MetaValue = {
	keys: string[]
}

function createCloudStore<T extends object>(defaultValue: T) {
	const cloudStorage = initCloudStorage()

	const writableStore = writable(defaultValue)

	function generateKeys(objectString: string): string[] {
		const chunkCount = Math.ceil(objectString.length / CHUNK_SIZE)
		return Array.from(
			{ length: chunkCount },
			(_, i) => `${KEY_PREFIX}${i.toString().padStart(4, '0')}`
		)
	}

	async function loadFromCloud(): Promise<T> {
		const metaDataJson = await cloudStorage.get(META_KEY)
		if (!metaDataJson) return defaultValue

		const { keys } = JSON.parse(metaDataJson) as MetaValue
		const chunks = await cloudStorage.get(keys)
		const objectString = keys.map((key) => chunks[key]).join('')

		try {
			return JSON.parse(objectString)
		} catch (error) {
			console.error('Failed to parse stored object:', error)
			return defaultValue
		}
	}

	async function saveToCloud(value: T): Promise<void> {
		const objectString = JSON.stringify(value)
		const keys = generateKeys(objectString)

		const chunks: Record<string, string> = {}
		for (let i = 0; i < keys.length; i++) {
			chunks[keys[i]] = objectString.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
		}

		await cloudStorage.set(META_KEY, JSON.stringify({ keys }))
		console.log('Saving to cloud:', META_KEY, keys)
		await Promise.all(
			Object.entries(chunks).map(([key, value]) => {
				cloudStorage.set(key, value)
				console.log('Saving to cloud:', key, value)
			})
		)

		// Clean up old keys
		const allKeys = await cloudStorage.getKeys()
		const oldKeys = allKeys.filter(
			(key) => key.startsWith(KEY_PREFIX) && !keys.includes(key) && key !== META_KEY
		)
		if (oldKeys.length > 0) {
			await cloudStorage.delete(oldKeys)
		}
	}

	loadFromCloud().then((saved) => {
		writableStore.set(saved)
		writableStore.subscribe(saveToCloud)
	})

	return writableStore
}

export default createCloudStore
