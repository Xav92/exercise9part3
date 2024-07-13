
import {useState} from "react";
import { Routes, Route, Outlet, Link } from "react-router-dom";
import { ApolloProvider, ApolloClient, InMemoryCache, gql, useQuery, useMutation } from "@apollo/client";
import NoteEdit from "./NoteEdit";

// Apollo Client setup
const client = new ApolloClient({
  uri: "http://localhost:3000/graphql",
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
        <h1>ToDo List</h1>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/note/:id" element={<NoteEdit />} />
          </Route>
        </Routes>
      </div>
    </ApolloProvider>
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

// GraphQL Queries and Mutations
const GET_NOTES = gql`
  query GetNotes {
    getNotes {
      id
      title
      content
    }
  }
`;

const ADD_NOTE = gql`
  mutation AddNote($title: String!, $content: String!) {
    addNote(title: $title, content: $content) {
      id
      title
      content
    }
  }
`;

const DELETE_NOTE = gql`
  mutation deleteNote($id: ID!) {
    deleteNote(id: $id) {
      id
    }
  }
`;

function Home() {
  const { loading, error, data, refetch } = useQuery(GET_NOTES);
  const [addNoteMutation] = useMutation(ADD_NOTE);
  const [deleteNoteMutation] = useMutation(DELETE_NOTE);
  const [addNewNote, setAddNewNote] = useState("");

  const addNote = async () => {
    await addNoteMutation({ variables: { title: addNewNote, content: "" } });
    refetch();
    setAddNewNote("");
  };

  const deleteNote = async (id) => {
    await deleteNoteMutation({ variables: { id } });
    refetch();
  };

  const handleInputChange = (e) => {
    setAddNewNote(e.target.value);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h2>Home</h2>
      <ul>
        {data.getNotes.map((note) => (
          <li key={note.id}>
            <Link to={`/note/${note.id}`}>{note.title}</Link>
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
