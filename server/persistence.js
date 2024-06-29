let _notes = [
    { id: "2", text: "CPSC 2650" },
    { id: "1", text: "An awesome web dev Note" },
  ];
  
  const notes = () => _notes;

  const addNote = (id,text) => {
    _notes.push({id,text});
  };

  const removeNote = (id => {
    _notes = _notes.filter(note => note.id !==id);
  })

  const editNote = (id,newText) => {
   _notes = _notes.map(note => note.id === id ? {...note,text:newText}:note);
  }


  const updateNoteWithImage = (id, imageUrl, authorName, authorLink) => {
    _notes = _notes.map(note => note.id === id ? { ...note, imageUrl, authorName, authorLink } : note);
  };
  
  export { notes,addNote,removeNote,editNote, updateNoteWithImage};

 