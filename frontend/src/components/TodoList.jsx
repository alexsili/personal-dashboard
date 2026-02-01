import { useState, useEffect } from 'react'

function TodoList({ token }) {
    // Primim token-ul ca prop de la App

    const [todos, setTodos] = useState([])
    const [loading, setLoading] = useState(true)
    const [newTodo, setNewTodo] = useState('')

    const API_URL = 'http://api.personal-dashboard.test/api'

    useEffect(() => {
        fetch(`${API_URL}/todos`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,  // Trimitem token-ul!
            }
        })
            .then(response => response.json())
            .then(data => {
                setTodos(data)
                setLoading(false)
            })
            .catch(error => {
                console.error('Error:', error)
                setLoading(false)
            })
    }, [token])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!newTodo.trim()) return

        fetch(`${API_URL}/todos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title: newTodo })
        })
            .then(response => response.json())
            .then(todo => {
                setTodos([todo, ...todos])
                setNewTodo('')
            })
            .catch(error => console.error('Error:', error))
    }

    const handleToggle = (todoToToggle) => {
        fetch(`${API_URL}/todos/${todoToToggle.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(response => response.json())
            .then(updatedTodo => {
                setTodos(todos.map(todo =>
                    todo.id === updatedTodo.id ? updatedTodo : todo
                ))
            })
            .catch(error => console.error('Error:', error))
    }

    const handleDelete = (todoToDelete) => {
        fetch(`${API_URL}/todos/${todoToDelete.id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Delete failed')
                setTodos(todos.filter(todo => todo.id !== todoToDelete.id))
            })
            .catch(error => console.error('Error:', error))
    }

    if (loading) {
        return <div>Loading todos...</div>
    }

    return (
        <div className="todo-container">
            <h2>My Todos</h2>

            <form onSubmit={handleSubmit} className="todo-form">
                <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new todo..."
                    className="todo-input"
                />
                <button type="submit" className="todo-button">Add</button>
            </form>

            <ul className="todo-list">
                {todos.map(todo => (
                    <li
                        key={todo.id}
                        className={todo.completed ? 'completed' : ''}
                    >
            <span
                className="checkbox"
                onClick={() => handleToggle(todo)}
            >
              {todo.completed ? '✓' : ''}
            </span>
                        <span
                            className="todo-title"
                            onClick={() => handleToggle(todo)}
                        >
              {todo.title}
            </span>
                        <button
                            className="delete-button"
                            onClick={() => handleDelete(todo)}
                        >
                            ✕
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default TodoList