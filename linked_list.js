import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import cors from "cors";

// LinkedList implementation
class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList {
  constructor() {
    this.head = null;
    this.length = 0;
  }

  addNode(value) {
    const newNode = new Node(value);
    if (!this.head) {
      this.head = newNode;
    } else {
      let current = this.head;
      while (current.next) {
        current = current.next;
      }
      current.next = newNode;
    }
    this.length += 1;
    return newNode;
  }

  getHead() {
    return this.head;
  }

  getLength() {
    return this.length;
  }
}

// Initialize the linked list
const linkedList = new LinkedList();
linkedList.addNode(1);
linkedList.addNode(2);
linkedList.addNode(3);

// Example data for Tweets and Authors
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

  type Node {
    value: Int
    next: Node
  }

  type LinkedList {
    head: Node
    length: Int
  }

  scalar Url
  scalar Date

  type Query {
    Tweet(id: ID!): Tweet
    Tweets(limit: Int, sortField: String, sortOrder: String): [Tweet]
    User: User
    head: Node
    length: Int
  }

  type Mutation {
    createTweet(body: String, author_id: ID!): Tweet
    deleteTweet(id: ID!): Tweet
    markTweetRead(id: ID!): Boolean
    addNode(value: Int!): Node
  }
`;

const resolvers = {
  Query: {
    Tweets: () => tweets,
    Tweet: (_, { id }) => tweets.find((tweet) => tweet.id == id),
    head: () => linkedList.getHead(),
    length: () => linkedList.getLength(),
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
    addNode: (_, { value }) => {
      return linkedList.addNode(value);
    },
  },
  Tweet: {
    Author: (tweet) => {
      return authors.find((author) => author.id == tweet.author_id);
    },
  },
  User: {
    full_name: (author) => `${author.first_name} ${author.last_name}`,
  },
  Node: {
    next: (node) => node.next,
  },
};

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  "/",
  cors(),
  express.json(),
  expressMiddleware(server, {})
);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
