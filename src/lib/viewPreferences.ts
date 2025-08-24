export type ViewMode = 'cards' | 'bookshelf'

interface ViewPreferences {
    tbr: ViewMode
    pastReads: ViewMode
}

const STORAGE_KEY = 'book-club-view-preferences'

export const getViewPreferences = (): ViewPreferences => {
    if (typeof window === 'undefined') {
        return { tbr: 'cards', pastReads: 'cards' }
    }

    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const preferences = JSON.parse(stored) as ViewPreferences
            return {
                tbr: preferences.tbr || 'cards',
                pastReads: preferences.pastReads || 'cards'
            }
        }
    } catch (error) {
        console.warn('Failed to parse view preferences from localStorage:', error)
    }

    return { tbr: 'cards', pastReads: 'cards' }
}

export const setViewPreference = (section: 'tbr' | 'pastReads', mode: ViewMode): void => {
    if (typeof window === 'undefined') return

    try {
        const preferences = getViewPreferences()
        preferences[section] = mode
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch (error) {
        console.warn('Failed to save view preferences to localStorage:', error)
    }
}
