import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import TodoList from './components/TodoList'
import NotesList from './components/NotesList'
import Weather from "./components/Weather.jsx"
import BudgetManager from './components/BudgetManager'
import Login from './pages/Login'
import Register from './pages/Register'
import { useTheme } from "./context/ThemeContext.jsx"
import './App.css'

// Componenta pentru Dashboard (pagina principală)
function Dashboard({ token }) {
    return (
        <>
            <Weather />
            <TodoList token={token} />
            <NotesList token={token} />
        </>
    )
}

// Layout pentru pagini autentificate
function AuthenticatedLayout({ user, token, onLogout, children }) {
    const { theme, toggleTheme } = useTheme()
    const navigate = useNavigate()

    return (
        <div className="container">
            <header className="app-header">
                <h1>Personal Dashboard</h1>
                <div className="user-info">
                    <button onClick={toggleTheme} className="theme-toggle">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <span>Welcome, {user.name}!</span>
                    <button onClick={onLogout} className="logout-button">Logout</button>
                </div>
            </header>

            <nav className="main-nav">
                <button onClick={() => navigate('/')}>
                    📊 Dashboard
                </button>
                <button onClick={() => navigate('/budget')}>
                    💰 Budget
                </button>
            </nav>

            <main>
                {children}
            </main>
        </div>
    )
}

function App() {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    const API_URL = 'http://api.personal-dashboard.test/api'

    useEffect(() => {
        if (token) {
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
                    localStorage.removeItem('token')
                    setToken(null)
                    setLoading(false)
                })
        } else {
            setLoading(false)
        }
    }, [token])

    const handleLogin = (userData, authToken) => {
        localStorage.setItem('token', authToken)
        setToken(authToken)
        setUser(userData)
    }

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

        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
    }

    if (loading) {
        return <div className="container">Loading...</div>
    }

    // Routing pentru utilizatori neautentificați
    if (!user) {
        return (
            <Routes>
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/register" element={<Register onLogin={handleLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        )
    }

    // Routing pentru utilizatori autentificați
    return (
        <Routes>
            <Route path="/" element={
                <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                    <Dashboard token={token} />
                </AuthenticatedLayout>
            } />
            <Route path="/budget" element={
                <AuthenticatedLayout user={user} token={token} onLogout={handleLogout}>
                    <BudgetManager token={token} />
                </AuthenticatedLayout>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App