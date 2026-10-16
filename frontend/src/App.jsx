import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API = `${import.meta.env.VITE_API_URL}/api/notes`;

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    axios.get(API)
      .then(res => setNotes(res.data))
      .catch(() => alert("Unable to load notes."));
  }, []);

  const closeForm = () => {
    setTitle("");
    setContent("");
    setEditId(null);
    setShowForm(false);
  };

  const saveNote = async e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const data = { title, content };
      const res = editId
        ? await axios.put(`${API}/${editId}`, data)
        : await axios.post(API, data);

      setNotes(old => editId
        ? old.map(n => n._id === editId ? res.data : n)
        : [res.data, ...old]);

      closeForm();
    } catch {
      alert("Unable to save note.");
    }
  };

  const editNote = note => {
    setEditId(note._id);
    setTitle(note.title);
    setContent(note.content);
    setShowForm(true);
  };

  const deleteNote = async id => {
    if (!window.confirm("Delete this note?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      setNotes(old => old.filter(n => n._id !== id));
    } catch {
      alert("Unable to delete note.");
    }
  };

  const filtered = notes.filter(n =>
    `${n.title} ${n.content}`.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <nav className="navbar">
        <span className="brand">✦ NoteSpace</span>
        <input className="search" placeholder="Search notes..."
          value={search} onChange={e => setSearch(e.target.value)} />
      </nav>

      <main className="main">
        <header className="app-header">
          <h1>My Notes</h1>
          <p>Your notes, all in one place</p>
        </header>

        <div className="add-area">
          <button onClick={() => {
            closeForm();
            setShowForm(true);
          }}>+ Add Note</button>
        </div>

        {showForm && (
          <form className="note-form" onSubmit={saveNote}>
            <h2>{editId ? "Edit Note" : "Create a New Note"}</h2>
            <input placeholder="Note title" value={title}
              onChange={e => setTitle(e.target.value)} required />
            <textarea placeholder="Write your note..." value={content}
              onChange={e => setContent(e.target.value)} required />
            <div className="form-actions">
              <button>{editId ? "Save Changes" : "Save Note"}</button>
              <button type="button" className="cancel"
                onClick={closeForm}>Cancel</button>
            </div>
          </form>
        )}

        <h2 className="section-title">Your Notes</h2>

        {filtered.length === 0 && (
          <p className="empty">
            {search ? "No matching notes found." : "No notes yet. Add your first note!"}
          </p>
        )}

        <div className="notes">
          {filtered.map(note => (
            <article className="note" key={note._id}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-actions">
                <button onClick={() => editNote(note)}>Edit</button>
                <button className="delete"
                  onClick={() => deleteNote(note._id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;