import fetch from "node-fetch";
import express from "express";
import { notes, addNote, removeNote, editNote, updateNoteWithImage } from "../persistence.js";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

router.get("/", function (req, res) {
  const allNotes = notes();
  res.send(allNotes);
});

router.get("/:id", function (req, res) {
  const { id } = req.params;
  const note = notes().find((note) => note.id === id);
  if (!note) {
    return res.status(404).send("Note not found");
  }
  res.send(note);
});

router.post("/", function (req, res) {
  const noteText = req.body.newNote;
  if (noteText) {
    const id = uuidv4();
    addNote(id, noteText);
  }
  res.redirect("/");
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  if (id) {
    removeNote(id);
    res.status(200).send();
  } else {
    res.status(400).send("Could not delete");
  }
});

router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { text } = req.body;
  if (id && text) {
    editNote(id, text);
    res.status(200).send();
  } else {
    res.status(400).send("Could not edit");
  }
});

router.post("/generate-image/:id", async (req, res) => {
  const { id } = req.params;
  const note = notes().find(note => note.id === id);
  if (!note) {
    return res.status(404).send("Note not found");
  }

  try {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${note.text}&client_id=${UNSPLASH_ACCESS_KEY}`);
    const data = await response.json();
    const firstImage = data.results[0];
    
    if (firstImage) {
      const imageUrl = firstImage.urls.regular;
      const authorName = firstImage.user.name;
      const authorLink = firstImage.user.links.html;

      updateNoteWithImage(id, imageUrl, authorName, authorLink);
      res.status(200).send({ imageUrl, authorName, authorLink });
    } else {
      res.status(404).send("No images found");
    }
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    res.status(500).send("Error fetching image");
  }
});

export default router;
