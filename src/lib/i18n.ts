import { derived, readonly, writable } from 'svelte/store'
import type { CountryProperties } from './countries'

const currentLanguage = writable('EN')

export const setLanguage = (language: string) => {
	if (supportedLanguages.includes(language)) {
		currentLanguage.set(language)
	}
}

export const i18n = derived(currentLanguage, ($currentLanguage) => {
	return translations[$currentLanguage] ?? defaultTranslation
})

export const i18nCountryKeyName = derived(currentLanguage, ($currentLanguage) => {
	return `NAME_${$currentLanguage}`
})

export const i18nNameExtractor = derived(i18nCountryKeyName, ($key) => {
	return (country: CountryProperties) => {
		const localizedName = (country as any)[$key] as string
		return localizedName || country.NAME_EN
	}
})

export const supportedLanguages = [
	'AR',
	'BN',
	'DE',
	'EN',
	'ES',
	'FA',
	'FR',
	'EL',
	'HE',
	'HI',
	'HU',
	'ID',
	'IT',
	'JA',
	'KO',
	'NL',
	'PL',
	'PT',
	'RU',
	'SV',
	'TR',
	'UK',
	'UR',
	'VI',
	'ZH',
]

type Translation = {
	countries: string
	all: string
	visited: string
	noVisited: string
	search: string
}
type Translations = Record<(typeof supportedLanguages)[number], Translation>
const defaultTranslation: Translation = {
	countries: 'Countries',
	all: 'All',
	visited: 'Visited',
	noVisited: 'No visited countries',
	search: 'Search...',
}
const translations: Translations = {
	EN: {
		countries: 'Countries',
		all: 'All',
		visited: 'Visited',
		noVisited: 'No visited countries',
		search: 'Search...',
	},
	AR: {
		countries: 'دول',
		all: 'الكل',
		visited: 'تمت زيارتها',
		noVisited: 'لا توجد دول تمت زيارتها',
		search: 'بحث...',
	},
	BN: {
		countries: 'দেশসমূহ',
		all: 'সব',
		visited: 'দেখা হয়েছে',
		noVisited: 'কোন দেখা দেশ নেই',
		search: 'অনুসন্ধান করুন...',
	},
	DE: {
		countries: 'Länder',
		all: 'Alle',
		visited: 'Besucht',
		noVisited: 'Keine besuchten Länder',
		search: 'Suchen...',
	},
	ES: {
		countries: 'Países',
		all: 'Todos',
		visited: 'Visitados',
		noVisited: 'No hay países visitados',
		search: 'Buscar...',
	},
	FA: {
		countries: 'کشورها',
		all: 'همه',
		visited: 'بازدید شده',
		noVisited: 'کشورهای بازدید نشده',
		search: 'جستجو...',
	},
	FR: {
		countries: 'Pays',
		all: 'Tous',
		visited: 'Visités',
		noVisited: 'Aucun pays visité',
		search: 'Chercher...',
	},
	EL: {
		countries: 'Χώρες',
		all: 'Όλα',
		visited: 'Επισκεφθέντα',
		noVisited: 'Δεν υπάρχουν επισκεφθείσες χώρες',
		search: 'Αναζήτηση...',
	},
	HE: {
		countries: 'מדינות',
		all: 'הכל',
		visited: 'נבקרו',
		noVisited: 'אין מדינות שביקרת בהן',
		search: 'חיפוש...',
	},
	HI: {
		countries: 'देश',
		all: 'सभी',
		visited: 'दौरा किया गया',
		noVisited: 'कोई दौरा किए गए देश नहीं',
		search: 'खोजें...',
	},
	HU: {
		countries: 'Országok',
		all: 'Összes',
		visited: 'Látogatott',
		noVisited: 'Nincs meglátogatott ország',
		search: 'Keresés...',
	},
	ID: {
		countries: 'Negara',
		all: 'Semua',
		visited: 'Dikunjungi',
		noVisited: 'Tidak ada negara yang dikunjungi',
		search: 'Cari...',
	},
	IT: {
		countries: 'Paesi',
		all: 'Tutti',
		visited: 'Visitati',
		noVisited: 'Nessun paese visitato',
		search: 'Cerca...',
	},
	JA: {
		countries: '国',
		all: 'すべて',
		visited: '訪問済み',
		noVisited: '訪問した国はありません',
		search: '検索...',
	},
	KO: {
		countries: '국가',
		all: '전체',
		visited: '방문함',
		noVisited: '방문한 국가 없음',
		search: '검색...',
	},
	NL: {
		countries: 'Landen',
		all: 'Alle',
		visited: 'Bezocht',
		noVisited: 'Geen bezochte landen',
		search: 'Zoeken...',
	},
	PL: {
		countries: 'Kraje',
		all: 'Wszystkie',
		visited: 'Odwiedzone',
		noVisited: 'Brak odwiedzonych krajów',
		search: 'Szukaj...',
	},
	PT: {
		countries: 'Países',
		all: 'Todos',
		visited: 'Visitados',
		noVisited: 'Nenhum país visitado',
		search: 'Pesquisar...',
	},
	RU: {
		countries: 'Страны',
		all: 'Все',
		visited: 'Посещённые',
		noVisited: 'Нет посещённых стран',
		search: 'Поиск...',
	},
	SV: {
		countries: 'Länder',
		all: 'Alla',
		visited: 'Besökta',
		noVisited: 'Inga besökta länder',
		search: 'Sök...',
	},
	TR: {
		countries: 'Ülkeler',
		all: 'Hepsi',
		visited: 'Ziyaret Edilenler',
		noVisited: 'Ziyaret edilen ülke yok',
		search: 'Arama...',
	},
	UK: {
		countries: 'Країни',
		all: 'Всі',
		visited: 'Відвідані',
		noVisited: 'Немає відвіданих країн',
		search: 'Пошук...',
	},
	UR: {
		countries: 'ممالک',
		all: 'سب',
		visited: 'دورہ کیا',
		noVisited: 'کوئی دیکھا ہوا ملک نہیں',
		search: 'تلاش کریں...',
	},
	VI: {
		countries: 'Các quốc gia',
		all: 'Tất cả',
		visited: 'Đã đến thăm',
		noVisited: 'Không có quốc gia đã thăm',
		search: 'Tìm kiếm...',
	},
	ZH: {
		countries: '国家',
		all: '所有',
		visited: '已访问',
		noVisited: '没有访问的国家',
		search: '搜索...',
	},
}
