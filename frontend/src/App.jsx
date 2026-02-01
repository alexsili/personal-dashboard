import { useState, useEffect } from 'react'
import TodoList from './components/TodoList'
import NotesList from './components/NotesList'
import Login from './pages/Login'
import Register from './pages/Register'
import './App.css'

function App() {
    // Auth state
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [page, setPage] = useState('login')  // 'login' sau 'register'
    const [loading, setLoading] = useState(true)

    const API_URL = 'http://api.personal-dashboard.test/api'

    // La mount, verifică dacă avem token valid
    useEffect(() => {
        if (token) {
            // Verifică token-ul cu API-ul
            fetch(`${API_URL}/user`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })
                .then(response => {
                    if (!response.ok) throw new Error('Invalid token')
                    return response.json()
                })
                .then(userData => {
                    setUser(userData)
                    setLoading(false)
                })
                .catch(() => {
                    // Token invalid, curăță
                    localStorage.removeItem('token')
                    setToken(null)
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [token])

    // Funcție pentru login/register success
    const handleLogin = (userData, authToken) => {
        localStorage.setItem('token', authToken)  // Salvează în browser
        setToken(authToken)
        setUser(userData)
    }

    // Funcție pentru logout
    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            })
        } catch (error) {
            console.error('Logout error:', error)
        }

        // Curăță state indiferent de răspuns
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    // Loading state
    if (loading) {
        return <div className="container">Loading...</div>
    }

    // Nu e autentificat - arată login sau register
    if (!user) {
        return page === 'login'
            ? <Login onLogin={handleLogin} onSwitchToRegister={() => setPage('register')} />
            : <Register onLogin={handleLogin} onSwitchToLogin={() => setPage('login')} />
    }

    // Autentificat - arată dashboard
    return (
        <div className="container">
            <header className="app-header">
                <h1>Personal Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user.name}!</span>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </header>

            <main>
                <TodoList token={token} />
                <NotesList token={token} />
            </main>
        </div>
    )
}

export default App