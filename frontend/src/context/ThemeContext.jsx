import { createContext, useState, useEffect, useContext } from 'react'

// 1. Creează Context-ul
const ThemeContext = createContext()

// 2. Creează Provider-ul (componenta care "oferă" tema)
export function ThemeProvider({ children }) {
    // Verifică localStorage pentru tema salvată, default 'dark'
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'dark'
    })

    // Când se schimbă tema, salvează în localStorage și actualizează body
    useEffect(() => {
        localStorage.setItem('theme', theme)
        document.body.setAttribute('data-theme', theme)
    }, [theme])

    // Funcție pentru toggle
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark')
    }

    // Oferă valorile către copii
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// 3. Custom hook pentru a folosi tema ușor
export function useTheme() {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context
}