import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";

// GraphQL queries and mutations
const GET_NOTE = gql`
  query GetNoteById($id: ID!) {
    getNoteById(id: $id) {
      id
      title
      content
      imageUrl
      authorName
      authorLink
    }
  }
`;

const UPDATE_NOTE = gql`
  mutation UpdateNote($id: ID!, $content: String!) {
    updateNote(id: $id, content: $content) {
      id
      content
    }
  }
`;

const GENERATE_IMAGE = gql`
  mutation GenerateImage($id: ID!) {
    generateImage(id: $id) {
      imageUrl
      authorName
      authorLink
    }
  }
`;

function NoteEdit() {
  const { id } = useParams();
  const [editText, setEditText] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_NOTE, {
    variables: { id }
  });

  const [updateNote] = useMutation(UPDATE_NOTE);
  const [generateImage] = useMutation(GENERATE_IMAGE);

  useEffect(() => {
    if (data && data.getNoteById) {
      setEditText(data.getNoteById.content);
    }
  }, [data]);

  const handleEdit = async () => {
    try {
      await updateNote({
        variables: { id, content: editText }
      });
      refetch(); // Refresh note after edit
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleInputChange = (e) => {
    setEditText(e.target.value);
  };

  const handleGenerateImage = async () => {
    try {
      await generateImage({ variables: { id } });
      refetch(); // Refresh note after generating image
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const note = data.getNoteById;

  return (
    <div>
      <h2>Note Edit</h2>
      <div>ID: {note.id}</div>
      <div>Original Text: {note.content}</div>
      <input type="text" value={editText} onChange={handleInputChange} />
      <button onClick={handleEdit}>Save</button>
      <button onClick={handleGenerateImage}>Generate Image</button>
      {note.imageUrl && (
        <div>
          <img src={note.imageUrl} alt="Note" />
          <div>
            Image by: <a href={note.authorLink}>{note.authorName}</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default NoteEdit;

