import { useState, useEffect } from 'react'
import './Weather.css'

function Weather() {
    const [weather, setWeather] = useState(null)
    const [city, setCity] = useState('Chisinau')
    const [inputCity, setInputCity] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Înlocuiește cu API key-ul tău
    const API_KEY = '911813c6cce390363ae2b3ff25dfa86f'

    const fetchWeather = (cityName) => {
        setLoading(true)
        setError('')

        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found')
                }
                return response.json()
            })
            .then(data => {
                setWeather(data)
                setCity(cityName)
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }

    // Fetch weather la mount
    useEffect(() => {
        fetchWeather(city)
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (inputCity.trim()) {
            fetchWeather(inputCity.trim())
            setInputCity('')
        }
    }

    // Funcție pentru icoană weather
    const getWeatherIcon = (iconCode) => {
        return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    }

    return (
        <div className="weather-widget">
            <h3>Weather</h3>

            {/* Search form */}
            <form onSubmit={handleSubmit} className="weather-search">
                <input
                    type="text"
                    value={inputCity}
                    onChange={(e) => setInputCity(e.target.value)}
                    placeholder="Enter city..."
                    className="weather-input"
                />
                <button type="submit" className="weather-button">🔍</button>
            </form>

            {/* Content */}
            {loading && <p className="weather-loading">Loading...</p>}

            {error && <p className="weather-error">{error}</p>}

            {weather && !loading && !error && (
                <div className="weather-info">
                    <div className="weather-main">
                        <img
                            src={getWeatherIcon(weather.weather[0].icon)}
                            alt={weather.weather[0].description}
                            className="weather-icon"
                        />
                        <span className="weather-temp">{Math.round(weather.main.temp)}°C</span>
                    </div>

                    <p className="weather-city">{weather.name}, {weather.sys.country}</p>
                    <p className="weather-description">{weather.weather[0].description}</p>

                    <div className="weather-details">
                        <span>💧 {weather.main.humidity}%</span>
                        <span>💨 {Math.round(weather.wind.speed)} m/s</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Weather