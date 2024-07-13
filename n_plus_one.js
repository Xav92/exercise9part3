// install npm install dataloader

import DataLoader from 'dataloader';
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';

// Example data
const tweets = [
  { id: 1, body: "Lorem Ipsum", date: new Date(), author_id: 10 },
  { id: 2, body: "Sic dolor amet", date: new Date(), author_id: 11 },
];
const authors = [
  {
    id: 10,
    username: "johndoe",
    first_name: "John",
    last_name: "Doe",
    avatar_url: "acme.com/avatars/10",
  },
  {
    id: 11,
    username: "janedoe",
    first_name: "Jane",
    last_name: "Doe",
    avatar_url: "acme.com/avatars/11",
  },
];


const userLoader = new DataLoader(async (keys) => {
    console.log(`Fetching users for keys: ${keys}`);
  
    const users = authors.filter(author => keys.includes(author.id));
    
    return keys.map(key => users.find(user => user.id === key) || new Error(`No user found for id ${key}`));
  });

// Schema definition
const typeDefs = `#graphql
  type Tweet {
    id: ID!
    body: String
    date: Date
    Author: User
  }

  type User {
    id: ID!
    username: String
    first_name: String
    last_name: String
    full_name: String
    name: String @deprecated
    avatar_url: Url
  }

  scalar Url
  scalar Date

  type Query {
    Tweet(id: ID!): Tweet
    Tweets(limit: Int, sortField: String, sortOrder: String): [Tweet]
    User: User
  }

  type Mutation {
    createTweet(body: String, author_id: ID!): Tweet
    deleteTweet(id: ID!): Tweet
    markTweetRead(id: ID!): Boolean
  }
`;

const resolvers = {
  Query: {
    Tweets: () => tweets,
    Tweet: (_, { id }) => tweets.find((tweet) => tweet.id == id),
  },
  Tweet: {
    Author: (tweet, _, { loaders }) => {
      console.log(`Loading author for tweet with author_id: ${tweet.author_id}`);
      if (!loaders || !loaders.user) {
        console.error("Loaders or user loader is undefined");
        throw new Error("Loaders or user loader is undefined");
      }
      return loaders.user.load(tweet.author_id);
    },
  },
  User: {
    full_name: (author) => `${author.first_name} ${author.last_name}`,
  },
  Mutation: {
    createTweet: (_, { body, author_id }) => {
      const nextTweetId =
        tweets.reduce((id, tweet) => {
          return Math.max(id, tweet.id);
        }, -1) + 1;
      const newTweet = {
        id: nextTweetId,
        date: new Date(),
        author_id,
        body,
      };
      tweets.push(newTweet);
      return newTweet;
    },
  },
};

const app = express();

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({
    loaders: {
      user: userLoader,
    },
  }),
});

await server.start();

// Middleware setup
app.use(
  "/",
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async () => ({
      loaders: {
        user: userLoader,
      },
    }),
  })
);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

