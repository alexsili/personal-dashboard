import { useState, useEffect } from 'react'

function NotesList({ token }) {
    const [notes, setNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [editingNote, setEditingNote] = useState(null)

    // Form state
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    const API_URL = 'http://api.personal-dashboard.test/api'

    // Fetch notes
    useEffect(() => {
        fetch(`${API_URL}/notes`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(response => response.json())
            .then(data => {
                setNotes(data)
                setLoading(false)
            })
            .catch(error => {
                console.error('Error:', error)
                setLoading(false)
            })
    }, [token])

    // Create note
    const handleCreate = (e) => {
        e.preventDefault()
        if (!title.trim()) return

        fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content })
        })
            .then(response => response.json())
            .then(note => {
                setNotes([note, ...notes])
                setTitle('')
                setContent('')
                setIsCreating(false)
            })
            .catch(error => console.error('Error:', error))
    }

    // Update note
    const handleUpdate = (e) => {
        e.preventDefault()
        if (!title.trim()) return

        fetch(`${API_URL}/notes/${editingNote.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ title, content })
        })
            .then(response => response.json())
            .then(updatedNote => {
                setNotes(notes.map(note =>
                    note.id === updatedNote.id ? updatedNote : note
                ))
                setTitle('')
                setContent('')
                setEditingNote(null)
            })
            .catch(error => console.error('Error:', error))
    }

    // Delete note
    const handleDelete = (noteToDelete) => {
        if (!confirm('Are you sure you want to delete this note?')) return

        fetch(`${API_URL}/notes/${noteToDelete.id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`,
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Delete failed')
                setNotes(notes.filter(note => note.id !== noteToDelete.id))
            })
            .catch(error => console.error('Error:', error))
    }

    // Start editing
    const startEditing = (note) => {
        setEditingNote(note)
        setTitle(note.title)
        setContent(note.content || '')
        setIsCreating(false)
    }

    // Cancel form
    const cancelForm = () => {
        setIsCreating(false)
        setEditingNote(null)
        setTitle('')
        setContent('')
    }

    if (loading) {
        return <div>Loading notes...</div>
    }

    return (
        <div className="notes-container">
            <div className="notes-header">
                <h2>My Notes</h2>
                {!isCreating && !editingNote && (
                    <button
                        className="add-note-button"
                        onClick={() => setIsCreating(true)}
                    >
                        + New Note
                    </button>
                )}
            </div>

            {/* Create/Edit Form */}
            {(isCreating || editingNote) && (
                <form onSubmit={editingNote ? handleUpdate : handleCreate} className="note-form">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Note title..."
                        className="note-title-input"
                        autoFocus
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Note content..."
                        className="note-content-input"
                        rows={4}
                    />
                    <div className="note-form-actions">
                        <button type="submit" className="save-button">
                            {editingNote ? 'Update' : 'Create'}
                        </button>
                        <button type="button" onClick={cancelForm} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Notes Grid */}
            <div className="notes-grid">
                {notes.map(note => (
                    <div key={note.id} className="note-card">
                        <h3 className="note-card-title">{note.title}</h3>
                        {note.content && (
                            <p className="note-card-content">{note.content}</p>
                        )}
                        <div className="note-card-actions">
                            <button onClick={() => startEditing(note)} className="edit-button">
                                Edit
                            </button>
                            <button onClick={() => handleDelete(note)} className="delete-button">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {notes.length === 0 && !isCreating && (
                <p className="no-notes">No notes yet. Create your first note!</p>
            )}
        </div>
    )
}

export default NotesList