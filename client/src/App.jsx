
import "./App.css";
import { useEffect, useState } from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import axios from "axios";
import NoteEdit from "./NoteEdit";

function App() {
  return (
    <div>
      <h1>ToDo List</h1>
      <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/note/:id" element={<NoteEdit />} />
        </Route>
      </Routes>
    </div>
  );
}

function Layout() {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <hr />
      <Outlet />
    </div>
  );
}

function Home() {
  const [notes, setNotes] = useState([]);
  const [addNewNote, setAddNewNote] = useState("");

  useEffect(() => {
    (async () => {
      let response = await axios.get("http://localhost:3000/notes/");
      let data = response.data;
      setNotes(data);
    })();
  }, []);

  const addNote = async () => {
    await axios.post("http://localhost:3000/notes/", { newNote: addNewNote });
    fetchNotes(); 
    setAddNewNote(""); 
  };

  const deleteNote = async (id) => {
    await axios.delete(`http://localhost:3000/notes/${id}`);
    fetchNotes(); 
  };

  const fetchNotes = async () => {
    let response = await axios.get("http://localhost:3000/notes/");
    let data = response.data;
    setNotes(data);
  };

  const handleInputChange = (e) => {
    setAddNewNote(e.target.value);
  };

  return (
    <div>
      <h2>Home</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <Link to={`/note/${note.id}`}>{note.text}</Link>
            <button onClick={() => deleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={addNewNote}
        onChange={handleInputChange}
        placeholder="Add a new note"
      />
      <button onClick={addNote}>Add</button>
    </div>
  );
}



export default App;
