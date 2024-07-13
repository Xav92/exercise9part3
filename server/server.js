import "dotenv/config.js";
import fetch from "node-fetch";
import DataLoader from 'dataloader';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index.js';
import notesRouter from './routes/notes.js';

// Constants
const port = process.env.PORT || 3000;

// Sample data
let notes = [
  { id: "1", title: "Note 1", content: "CPSC 2650" },
  { id: "2", title: "Note 2", content: "Almost the end " },
];


const noteLoader = new DataLoader(async (keys) => {
  return keys.map(key => notes.find(note => note.id === key));
});

// GraphQL schema
const typeDefs = `
  type Note {
    id: ID!
    title: String!
    content: String!
    imageUrl: String
    authorName: String
    authorLink: String
  }

  type Query {
    getNotes: [Note]
    getNoteById(id: ID!): Note
  }

  type Mutation {
    addNote(title: String!, content: String!): Note
    updateNote(id: ID!, title: String, content: String): Note
    deleteNote(id: ID!): Note
    generateImage(id: ID!): Note
  }
`;


// GraphQL resolvers
const resolvers = {
  Query: {
    getNotes: () => notes,
    getNoteById: async (_, { id }) => await noteLoader.load(id),
  },
  Mutation: {
    addNote: (_, { title, content }) => {
      const newNote = { id: String(notes.length + 1), title, content };
      notes.push(newNote);
      return newNote;
    },
    updateNote: (_, { id, title, content }) => {
      const noteIndex = notes.findIndex(note => note.id === id);
      if (noteIndex !== -1) {
        if (title) notes[noteIndex].title = title;
        if (content) notes[noteIndex].content = content;
        return notes[noteIndex];
      }
      return null;
    },
    deleteNote: (_, { id }) => {
      const noteIndex = notes.findIndex(note => note.id === id);
      if (noteIndex !== -1) {
        const deletedNote = notes[noteIndex];
        notes = notes.filter(note => note.id !== id);
        return deletedNote;
      }
      return null;
    },
    generateImage: async (_, { id }) => {
      const noteIndex = notes.findIndex(note => note.id === id);
      if (noteIndex === -1) return null;

      const note = notes[noteIndex];
      try {
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${note.content}&client_id=${UNSPLASH_ACCESS_KEY}`);
        const data = await response.json();
        const firstImage = data.results[0];
        
        if (firstImage) {
          const imageUrl = firstImage.urls.regular;
          const authorName = firstImage.user.name;
          const authorLink = firstImage.user.links.html;
          
          note.imageUrl = imageUrl;
          note.authorName = authorName;
          note.authorLink = authorLink;
          return note;
        }
      } catch (error) {
        console.error("Error fetching image from Unsplash:", error);
        throw new Error("Error fetching image");
      }

      return null;
    }
  }
};


// Initialize the Apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

const app = express();

// view engine setup
app.set("views", path.join("views"));
app.set("view engine", "pug");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join("public")));

app.use("/", indexRouter);
app.use("/notes", notesRouter);

app.use(
  "/graphql",
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      loaders: {
        noteLoader,
      },
    }),
  })
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Start http server
app.listen(port, () => {
  // console.log(`Server started at http://localhost:${port}`);
  console.log(`GraphQL endpoint available at http://localhost:${port}/graphql`);
});

