import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Auth.css'
function Register({ onLogin }) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const API_URL = 'http://api.personal-dashboard.test/api'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (password !== passwordConfirmation) {
            setError('Passwords do not match')
            return
        }

        setLoading(true)

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation  // Laravel așteaptă snake_case
                })
            })

            const data = await response.json()

            if (!response.ok) {
                // Laravel returnează errors object pentru validare
                if (data.errors) {
                    const firstError = Object.values(data.errors)[0][0]
                    throw new Error(firstError)
                }
                throw new Error(data.message || 'Registration failed')
            }

            // Succes! Autologin după register
            onLogin(data.user, data.token)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <h1>Register</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                <div className="form-group">
                    <label>Confirm Password</label>
                    <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Register'}
                </button>
            </form>

            <p className="auth-switch">
                Already have an account?{' '}
                <button type="button" onClick={() => navigate('/login')}>
                    Login
                </button>
            </p>
        </div>
    )
}

export default Register