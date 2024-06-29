import { useState ,useEffect} from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function NoteEdit() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    fetchNote();
  }, []);

  const fetchNote = async () => {
    try {
      let response = await axios.get(`http://localhost:3000/notes/${id}`);
      setNote(response.data);
      setEditText(response.data.text); 
    } catch (error) {
      console.error("Error fetching note:", error);
    }
  };

  const handleEdit = async () => {
    try {
      await axios.patch(`http://localhost:3000/notes/${id}`, { text: editText });
      fetchNote(); // Refresh note after edit
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  const handleInputChange = (e) => {
    setEditText(e.target.value);
  };

  const generateImage = async () => {
    try {
      let response = await axios.post(`http://localhost:3000/notes/generate-image/${id}`);
      const { imageUrl, authorName, authorLink } = response.data;
      setNote((prevNote) => ({
        ...prevNote,
        imageUrl,
        authorName,
        authorLink
      }));
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  if (!note) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Note Edit</h2>
      <div>ID: {note.id}</div>
      <div>Original Text: {note.text}</div>
      <input type="text" value={editText} onChange={handleInputChange} />
      <button onClick={handleEdit}>Save</button>
      <button onClick={generateImage}>Generate Image</button>
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

